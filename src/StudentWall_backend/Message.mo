import Types "Types";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Response "Response";
import _User "User";
module {
    public func addComment(msg : Types.Message, comment : Types.Comment) : (Types.Message) {
        let newComm = Buffer.fromArray<Types.Comment>(msg.comments);
        newComm.add(comment);
        return ({comments = Buffer.toArray(newComm); text = msg.text; content = msg.content; vote = msg.vote; creator = msg.creator; createdAt = msg.createdAt; updatedAt = msg.updatedAt});
    };
    public func removeComment(msg : Types.Message, commentId : Nat) : (Types.Message) {
        let tempComm = Buffer.fromArray<Types.Comment>(msg.comments);
        let comm = tempComm.getOpt(commentId);
        switch(comm) {
            case(?comm) {  
                ignore tempComm.remove(commentId);
                return ({comments = Buffer.toArray<Types.Comment>(tempComm); text = msg.text; content = msg.content; vote = msg.vote; creator = msg.creator; createdAt = msg.createdAt; updatedAt = msg.updatedAt});
            };
            case(_) { 
                return msg
            };
        };
    };

    func desc(x:Int, y:Int) : { #less; #equal; #greater } {
        switch(Int.compare(x,y)) {
        case(#less) { #greater };
        case(#greater) { #less };
        case(_) { #equal };
        };
    };

    public func ranked(messageHash : HashMap.HashMap<Nat, Types.Message>, userhash : HashMap.HashMap<Principal, Types.User>) : Buffer.Buffer<Response.Message> {
    var arr  = Buffer.Buffer<Response.Message>(1);
    for ((key, value) in messageHash.entries()) {
        let u = _User.get(userhash, value.creator);
        switch(u) {
            case(?u) {  
                arr.add({creator = u; id = Nat.toText(key); message = value});
            };
            case(_) { 
                arr.add({creator = _User.getAnon(); id = Nat.toText(key); message = value})
            };
        };
    };
    arr.sort(func (x : Response.Message, y : Response.Message) {
      return desc(x.message.vote, y.message.vote);
    });
    return arr;
  };
}