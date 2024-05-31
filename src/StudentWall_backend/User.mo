import Principal "mo:base/Principal";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Types "Types";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
module {
    public func isRegistered(u : HashMap.HashMap<Principal, Types.User>, p:Principal) : (Bool) {
        let anon : Bool = Principal.isAnonymous(p);
        if (anon) return false;
        let user = u.get(p);
        switch(user) {
            case(?user) {  
                return true
            };
            case(_) { 
                return false
            };
        };
    };

    public func isAdmin(u : Buffer.Buffer<Principal>, p : Principal) : (Bool) {
        Buffer.contains<Principal>(u, p,Principal.equal);
    };

    public func get(uHash : HashMap.HashMap<Principal, Types.User>, p : Principal) : ?Types.User {
        let u = uHash.get(p);
    };

    public func getAnon() : Types.User {
        let bytes : [Nat8]= [ 0, 255, 0];
        {allowMsg = false; image = Blob.fromArray(bytes); name = "Anon"}
    }
}