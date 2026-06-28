#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::{Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.initialize(&owner, &86400u64); // 1 day

    assert_eq!(client.owner(), owner);
    assert_eq!(client.inactivity_period(), 86400);
    assert_eq!(client.status(), 0);
    assert_eq!(client.beneficiaries().len(), 0);
    assert_eq!(client.executors().len(), 0);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_initialize_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.initialize(&owner, &86400u64);
    client.initialize(&owner, &86400u64);
}

#[test]
fn test_check_in_resets_inactivity() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.initialize(&owner, &3600u64); // 1 hour

    // Jump time forward 30 minutes (still within period)
    env.ledger().set_timestamp(1800);
    client.check_in(&owner);

    // Jump 30 more minutes (would be inactive without check-in)
    env.ledger().set_timestamp(3600);
    assert!(!client.is_inactive());
}

#[test]
fn test_detect_inactivity() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    client.initialize(&owner, &100u64);

    // Jump time past inactivity period
    env.ledger().set_timestamp(200);
    assert!(client.is_inactive());
}

#[test]
fn test_beneficiary_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let ben1 = Address::generate(&env);
    let ben2 = Address::generate(&env);

    client.initialize(&owner, &86400u64);
    client.add_beneficiary(&owner, &ben1, &1000i128);
    client.add_beneficiary(&owner, &ben2, &2000i128);

    assert_eq!(client.beneficiaries().len(), 2);
    assert_eq!(client.beneficiary_amount(&ben1), 1000);
    assert_eq!(client.beneficiary_amount(&ben2), 2000);

    client.remove_beneficiary(&owner, &ben1);
    assert_eq!(client.beneficiaries().len(), 1);
    assert_eq!(client.beneficiary_amount(&ben1), 0);
}

#[test]
#[should_panic(expected = "already beneficiary")]
fn test_add_duplicate_beneficiary_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let ben = Address::generate(&env);

    client.initialize(&owner, &86400u64);
    client.add_beneficiary(&owner, &ben, &1000i128);
    client.add_beneficiary(&owner, &ben, &500i128);
}

#[test]
fn test_executor_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let exec = Address::generate(&env);

    client.initialize(&owner, &86400u64);
    client.add_executor(&owner, &exec);

    assert_eq!(client.executors().len(), 1);

    client.remove_executor(&owner, &exec);
    assert_eq!(client.executors().len(), 0);
}

#[test]
fn test_full_inheritance_flow() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let executor = Address::generate(&env);
    let beneficiary = Address::generate(&env);

    // Setup
    client.initialize(&owner, &100u64);
    client.add_beneficiary(&owner, &beneficiary, &5000i128);
    client.add_executor(&owner, &executor);

    // Owner goes inactive
    env.ledger().set_timestamp(200);
    assert!(client.is_inactive());

    // Executor triggers inheritance
    client.trigger_inheritance(&executor);
    assert_eq!(client.status(), 1);

    // Executor confirms distribution
    client.confirm_distribution(&executor);
    assert_eq!(client.status(), 2);

    // Beneficiary claims
    assert!(!client.has_claimed(&beneficiary));
    client.claim(&beneficiary);
    assert!(client.has_claimed(&beneficiary));
}

#[test]
#[should_panic(expected = "inactivity period not elapsed")]
fn test_trigger_before_inactivity_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let executor = Address::generate(&env);

    client.initialize(&owner, &86400u64);
    client.add_executor(&owner, &executor);

    // Try to trigger before period elapses
    client.trigger_inheritance(&executor);
}

#[test]
#[should_panic(expected = "distribution not confirmed")]
fn test_claim_before_confirmation_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let executor = Address::generate(&env);
    let beneficiary = Address::generate(&env);

    client.initialize(&owner, &100u64);
    client.add_beneficiary(&owner, &beneficiary, &5000i128);
    client.add_executor(&owner, &executor);

    env.ledger().set_timestamp(200);
    client.trigger_inheritance(&executor);

    // Claim without confirmation
    client.claim(&beneficiary);
}

#[test]
#[should_panic(expected = "already claimed")]
fn test_double_claim_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let executor = Address::generate(&env);
    let beneficiary = Address::generate(&env);

    client.initialize(&owner, &100u64);
    client.add_beneficiary(&owner, &beneficiary, &5000i128);
    client.add_executor(&owner, &executor);

    env.ledger().set_timestamp(200);
    client.trigger_inheritance(&executor);
    client.confirm_distribution(&executor);
    client.claim(&beneficiary);
    client.claim(&beneficiary);
}

#[test]
#[should_panic(expected = "not an executor")]
fn test_unauthorized_trigger_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(Contract, ());
    let client = ContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let stranger = Address::generate(&env);

    client.initialize(&owner, &100u64);
    env.ledger().set_timestamp(200);
    client.trigger_inheritance(&stranger);
}
