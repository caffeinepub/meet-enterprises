// Migration: drop `accessControlState` stable variable that was removed
// when the authorization mixin was removed from the actor.
// This file explicitly consumes the old field so the upgrade does not trap.
module {

  // ── Old types (inline — copied from prior version) ───────────────────────
  type OldUserRole = { #admin; #guest; #user };

  // Minimal structural type for the old Map — only root/size needed to match
  type OldMapNode<K, V> = {
    #internal : { children : [var ?OldMapNode<K, V>]; data : OldMapData<K, V> };
    #leaf : { data : OldMapData<K, V> };
  };
  type OldMapData<K, V> = { var count : Nat; kvs : [var ?(K, V)] };
  type OldMap<K, V> = { var root : OldMapNode<K, V>; var size : Nat };

  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : OldMap<Principal, OldUserRole>;
  };

  // ── Migration input: only the fields being explicitly handled ────────────
  type OldActor = {
    accessControlState : OldAccessControlState;
  };

  // ── Migration output: empty — no fields produced (all others are inherited) ──
  type NewActor = {};

  // Consume `accessControlState` and discard it; all other stable fields
  // are automatically inherited by the runtime.
  public func run(_old : OldActor) : NewActor {
    {}
  };
};
