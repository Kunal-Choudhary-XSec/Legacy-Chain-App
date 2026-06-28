#![no_std]
#![allow(deprecated)]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, Symbol, Vec};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Owner,
    InactivityPeriod,
    LastCheckIn,
    Status,
    Beneficiaries,
    Executors,
    Claimed,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Initialize the inheritance contract with an owner and inactivity period (in seconds).
    pub fn initialize(env: Env, owner: Address, inactivity_period: u64) {
        assert!(!env.storage().instance().has(&DataKey::Owner), "already initialized");
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::InactivityPeriod, &inactivity_period);
        env.storage().instance().set(&DataKey::LastCheckIn, &env.ledger().timestamp());
        env.storage().instance().set(&DataKey::Status, &0u32); // 0 = Active
        env.storage().instance().set(&DataKey::Beneficiaries, &Map::<Address, i128>::new(&env));
        env.storage().instance().set(&DataKey::Executors, &Map::<Address, bool>::new(&env));
        env.storage().instance().set(&DataKey::Claimed, &Map::<Address, bool>::new(&env));
        env.events().publish((Symbol::new(&env, "initialized"),), (owner, inactivity_period));
    }

    /// Owner check-in: resets the inactivity timer.
    pub fn check_in(env: Env, owner: Address) {
        owner.require_auth();
        let stored: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        assert_eq!(owner, stored, "not owner");
        env.storage().instance().set(&DataKey::LastCheckIn, &env.ledger().timestamp());
        env.events().publish((Symbol::new(&env, "check_in"),), (owner,));
    }

    /// Owner adds a beneficiary with an amount.
    pub fn add_beneficiary(env: Env, owner: Address, beneficiary: Address, amount: i128) {
        owner.require_auth();
        let stored: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        assert_eq!(owner, stored, "not owner");
        let mut bens: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Beneficiaries).unwrap();
        assert!(!bens.contains_key(beneficiary.clone()), "already beneficiary");
        bens.set(beneficiary.clone(), amount);
        env.storage().instance().set(&DataKey::Beneficiaries, &bens);
        env.events().publish(
            (Symbol::new(&env, "beneficiary_added"),),
            (beneficiary, amount),
        );
    }

    /// Owner removes a beneficiary.
    pub fn remove_beneficiary(env: Env, owner: Address, beneficiary: Address) {
        owner.require_auth();
        let stored: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        assert_eq!(owner, stored, "not owner");
        let mut bens: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Beneficiaries).unwrap();
        assert!(bens.contains_key(beneficiary.clone()), "not a beneficiary");
        bens.remove(beneficiary.clone());
        env.storage().instance().set(&DataKey::Beneficiaries, &bens);
        env.events().publish((Symbol::new(&env, "beneficiary_removed"),), (beneficiary,));
    }

    /// Owner adds an executor who can trigger the inheritance.
    pub fn add_executor(env: Env, owner: Address, executor: Address) {
        owner.require_auth();
        let stored: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        assert_eq!(owner, stored, "not owner");
        let mut execs: Map<Address, bool> =
            env.storage().instance().get(&DataKey::Executors).unwrap();
        execs.set(executor.clone(), true);
        env.storage().instance().set(&DataKey::Executors, &execs);
        env.events().publish((Symbol::new(&env, "executor_added"),), (executor,));
    }

    /// Owner removes an executor.
    pub fn remove_executor(env: Env, owner: Address, executor: Address) {
        owner.require_auth();
        let stored: Address = env.storage().instance().get(&DataKey::Owner).unwrap();
        assert_eq!(owner, stored, "not owner");
        let mut execs: Map<Address, bool> =
            env.storage().instance().get(&DataKey::Executors).unwrap();
        execs.remove(executor.clone());
        env.storage().instance().set(&DataKey::Executors, &execs);
        env.events().publish((Symbol::new(&env, "executor_removed"),), (executor,));
    }

    /// Executor triggers inheritance after inactivity period elapses.
    pub fn trigger_inheritance(env: Env, executor: Address) {
        executor.require_auth();
        let execs: Map<Address, bool> =
            env.storage().instance().get(&DataKey::Executors).unwrap();
        assert!(execs.contains_key(executor.clone()), "not an executor");
        let last: u64 = env.storage().instance().get(&DataKey::LastCheckIn).unwrap();
        let period: u64 = env.storage().instance().get(&DataKey::InactivityPeriod).unwrap();
        assert!(
            env.ledger().timestamp() > last + period,
            "inactivity period not elapsed"
        );
        let status: u32 = env.storage().instance().get(&DataKey::Status).unwrap();
        assert_eq!(status, 0, "already triggered");
        env.storage().instance().set(&DataKey::Status, &1u32);
        env.events().publish((Symbol::new(&env, "inheritance_triggered"),), (executor,));
    }

    /// Executor confirms distribution, allowing beneficiaries to claim.
    pub fn confirm_distribution(env: Env, executor: Address) {
        executor.require_auth();
        let execs: Map<Address, bool> =
            env.storage().instance().get(&DataKey::Executors).unwrap();
        assert!(execs.contains_key(executor.clone()), "not an executor");
        let status: u32 = env.storage().instance().get(&DataKey::Status).unwrap();
        assert_eq!(status, 1, "inheritance not triggered");
        env.storage().instance().set(&DataKey::Status, &2u32);
        env.events().publish(
            (Symbol::new(&env, "distribution_confirmed"),),
            (executor,),
        );
    }

    /// Beneficiary claims their allocated amount.
    pub fn claim(env: Env, beneficiary: Address) {
        beneficiary.require_auth();
        let status: u32 = env.storage().instance().get(&DataKey::Status).unwrap();
        assert_eq!(status, 2, "distribution not confirmed");
        let bens: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Beneficiaries).unwrap();
        let amount = bens.get(beneficiary.clone()).expect("not a beneficiary");
        let mut claimed: Map<Address, bool> =
            env.storage().instance().get(&DataKey::Claimed).unwrap();
        assert!(!claimed.contains_key(beneficiary.clone()), "already claimed");
        claimed.set(beneficiary.clone(), true);
        env.storage().instance().set(&DataKey::Claimed, &claimed);
        env.events().publish((Symbol::new(&env, "claimed"),), (beneficiary, amount));
    }

    // --- Read functions ---

    pub fn owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner).unwrap()
    }

    pub fn status(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Status).unwrap_or(0)
    }

    pub fn last_check_in(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::LastCheckIn).unwrap_or(0)
    }

    pub fn inactivity_period(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::InactivityPeriod).unwrap_or(0)
    }

    pub fn beneficiaries(env: Env) -> Vec<Address> {
        let bens: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Beneficiaries).unwrap();
        bens.keys()
    }

    pub fn beneficiary_amount(env: Env, addr: Address) -> i128 {
        let bens: Map<Address, i128> =
            env.storage().instance().get(&DataKey::Beneficiaries).unwrap();
        bens.get(addr).unwrap_or(0)
    }

    pub fn executors(env: Env) -> Vec<Address> {
        let execs: Map<Address, bool> =
            env.storage().instance().get(&DataKey::Executors).unwrap();
        execs.keys()
    }

    pub fn has_claimed(env: Env, addr: Address) -> bool {
        let claimed: Map<Address, bool> =
            env.storage().instance().get(&DataKey::Claimed).unwrap();
        claimed.contains_key(addr)
    }

    pub fn is_inactive(env: Env) -> bool {
        let last: u64 = env.storage().instance().get(&DataKey::LastCheckIn).unwrap_or(0);
        let period: u64 = env.storage().instance().get(&DataKey::InactivityPeriod).unwrap_or(0);
        env.ledger().timestamp() > last + period
    }
}

mod test;
