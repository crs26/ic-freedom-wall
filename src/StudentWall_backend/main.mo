import Type "Types";
import Admin "Admin";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Hash "mo:base/Hash";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Int "mo:base/Int";
import _Message "Message";
import Message "Message";
import Response "Response";
import Blob "mo:base/Blob";
import _User "User";
import Time "mo:base/Time";
import List "mo:base/List";

actor class StudentWall() {
  type Message = Type.Message;
  type Content = Type.Content;
  type Survey = Type.Survey;
  type Answer = Type.Answer;
  type User = Type.User;
  type Comment = Type.Comment;

  stable var enReg : Bool = true;
  stable var enMod : Bool = false;
  stable var postCount : Nat = 0;
  stable var testV : Text = "global";

  stable var messageList = List.nil<Type.MessageList>();
  stable var userList = List.nil<Type.UserList>();

  func _natHash(n : Nat) : (Nat32) {
    Text.hash(Nat.toText(n));
  };

  var messageRanked = Buffer.Buffer<Response.Message>(1);
  var messageHash = HashMap.HashMap<Nat, Message>(1, Nat.equal, _natHash);
  var userHash = HashMap.HashMap<Principal, User>(1, Principal.equal, Principal.hash);
  var adminBuffer = Buffer.Buffer<Principal>(1);

  // Add a new message to the wall
  public shared ({ caller }) func writeMessage(t : Text, c : Content) : async Result.Result<Nat, Text> {
    let isReg =  _User.isRegistered(userHash, caller);
    if(isReg) {  
      postCount += 1;
      messageHash.put(postCount, {text = t; content = c; creator = caller; vote = 0; comments = []; createdAt = Time.now(); updatedAt = null});
      messageRanked := _Message.ranked(messageHash, userHash);
      return #ok(postCount);
    } else { 
      return #err("Can't post a message, invalid user.") 
    };
  };

  // Get a specific message by ID
  public query func getMessage(messageId : Nat) : async Result.Result<Response.Message, Text> {
    let msg : ?Message = messageHash.get(messageId);
    switch(msg) {
      case(?value) {
        let u = _User.get(userHash, value.creator);
        switch(u) {
          case(?u) {  
            return #ok({id = Nat.toText(messageId); message = value; creator = u});
          };
          case(_) { 
            // return #ok({id = messageId; message = value; creator = u});
            return #err("User is deactivated");
          };
        };
      };
      case(_) {
        return #err("Message with id " # Nat.toText(messageId) #  "does not exist.");
      };
    };
  };

  // Get post count
  public query func getPostCount() : async Nat {
    postCount;
  };

  public query func getDataSize() : async [Nat] {
    return [postCount, messageHash.size(), userHash.size()]
  };

  // Get user messages
  // public shared ({caller}) func getUserMessages() : async Result.Result<[Response.Message], Text>{
  //   let buff = Buffer.Buffer<Response.Message>(1);
  //   let t = HashMap.mapFilter<Nat, Message, Message>(messageHash, Nat.equal, _natHash, func (k, v) {
  //     let u = _User.getUser(p);
  //     switch(u) {
  //       case(?u) {  
  //       if(Principal.equal(v.creator, caller)){
  //         buff.add(v);
  //         return ?v
  //       }else return null

  //       };
  //       case(_) { };
  //     };
  //   });
  //   return #ok(Buffer.toArray(buff))
  // };

  // Update the content for a specific message by ID
  public shared ({ caller }) func updateMessage(messageId : Nat, t : Text, c : Content) : async Result.Result<(), Text> {
    let msg : ?Message = messageHash.remove(messageId);
    switch(msg) {
      case(?value) {  
        let owner : Bool = Principal.equal(caller, value.creator);
        if (owner) {
          messageHash.put(messageId, {text = t; content = c; creator = value.creator; vote = value.vote; comments = value.comments; createdAt = value.createdAt; updatedAt = ?Time.now()});
          return #ok();
        };
        return #err("Only the owner can update the content");
      };
      case(_) { 
        return #err("Message with id " # Nat.toText(messageId) #  " does not exist.")
      };
    };
  };

  // Delete a specific message by ID
  public shared ({ caller }) func deleteMessage(messageId : Nat) : async Result.Result<(), Text> {
    let msg : ?Message = messageHash.remove(messageId);
    switch(msg) {
      case(?msg) {
        if (Principal.equal(msg.creator, caller) or _User.isAdmin(adminBuffer, caller)) {
          messageHash.put(messageId, msg);
          return #err("Only the creator itself or an admin can delete the message.");
        } else {
          messageRanked := _Message.ranked(messageHash, userHash);
          return #ok();
        }
      };
      case(_) { 
        return #err("Message with id " # Nat.toText(messageId) #  "does not exist.")
      };
    };
  };

  // Voting
  public func upVote(messageId : Nat) : async Result.Result<(), Text> {
    let msg : ?Message = messageHash.get(messageId);
    switch(msg) {
      case(?value) {
        messageHash.put(messageId, {text = value.text; content = value.content; creator = value.creator; vote = value.vote + 1; comments = value.comments; createdAt = value.createdAt; updatedAt = value.updatedAt});
        messageRanked := _Message.ranked(messageHash, userHash);
        return #ok();
      };
      case(_) {
        return #err("Message with id " # Nat.toText(messageId) #  "does not exist.");
      };
    };
  };

  public func downVote(messageId : Nat) : async Result.Result<(), Text> {
    let msg : ?Message = messageHash.get(messageId);
    switch(msg) {
      case(?value) {
        messageHash.put(messageId, {text = value.text; content = value.content; creator = value.creator; vote = value.vote - 1; comments = value.comments; createdAt = value.createdAt; updatedAt = value.updatedAt});
        messageRanked := _Message.ranked(messageHash, userHash);
        return #ok();
      };
      case(_) {
        return #err("Message with id " # Nat.toText(messageId) #  "does not exist.");
      };
    };
  };

  // Get all messages
  // public query func getAllMessages() : async [Response.Message] {
  //   var arr  = Buffer.Buffer<Response.Message>(1);
  //   for ((key, value) in messageHash.entries()) {
  //     let u = _User.getUser(userHash, value.creator);
  //     switch(u) {
  //       case(?u) {  
  //         arr.add({id = key; message = value; creator = u});
  //       };
  //       case(_) { 
  //         // dont add user
  //       };
  //     };
  //   };
  //   arr.sort(func (x : Response.Message, y : Response.Message) {
  //     return Nat.compare(x.id, y.id);
  //   });
  //   return Buffer.toArray(arr);
  // };

  public query func getAllUserMessage(p : Principal) : async Result.Result<[Response.Message], Text> {
    let user : ?User = userHash.get(p);
    switch(user) {
      case(?user) {
        let buff = Buffer.Buffer<Response.Message>(1);
        for((key, value) in messageHash.entries()) {
          let u = _User.get(userHash, value.creator);
          switch(u) {
            case(?u) {  
              if(Principal.equal(value.creator, p)) buff.add({id = Nat.toText(key); message = value; creator = u});
            };
            case(_) { 
              // dont add user
            };
          };
        };
        return #ok(Buffer.toArray(buff))
      };
      case(_) { 
        return #err("User not found or invalid.")
      };
    };
  };

  // Get all messages ordered by votes
  func desc(x:Int, y:Int) : { #less; #equal; #greater } {
    switch(Int.compare(x,y)) {
      case(#less) { #greater };
      case(#greater) { #less };
      case(_) { #equal };
    };
  };

  public query func getAllMessagesRanked() : async [Response.Message] {
    var arr  = Buffer.Buffer<Response.Message>(1);
    for ((key, value) in messageHash.entries()) {
      let u = _User.get(userHash, value.creator);
      switch(u) {
        case(?u) {  
          arr.add({id = Nat.toText(key); message = value; creator = u});
        };
        case(_) { 
          // dont add user
        };
      };
    };
    arr.sort(func (x : Response.Message, y : Response.Message) {
      return desc(x.message.vote, y.message.vote);
    });
    return Buffer.toArray(arr);
  };

  // Get message by rank position
  public query func getMessageByRank(rankIndex : Nat) : async Result.Result<Response.Message, Text> {
    // let msg : ?Message = messageHash.get(messageId);
    let msg = messageRanked.getOpt(rankIndex);
    switch(msg) {
      case(?value) {
        let u = _User.get(userHash, value.message.creator);
        switch(u) {
          case(?u) {  
            return #ok({id = value.id; message = value.message; creator = u});
          };
          case(_) { 
            // return #ok({id = messageId; message = value; creator = u});
            return #err("User is deactivated");
          };
        };
      };
      case(_) {
        return #err("Message with rank index " # Nat.toText(rankIndex) #  " does not exist.");
      };
    };
  };

  // Comment functions
  public shared({caller}) func writeComment(t : Text, messageId : Nat) : async (Result.Result<(), Text>) {
    let isReg : Bool = _User.isRegistered(userHash, caller);
    if(not isReg) return #err("Can't write comment, invalid user.");
    if(Principal.isAnonymous(caller)) return #err("Can't write comment, anonymous user");
    let m = messageHash.get(messageId);
    switch(m) {
      case(?m) {
        messageHash.put(messageId, _Message.addComment(m, {creator = caller; text = t; createdAt = Time.now(); updatedAt = null}));
        return #ok();
      };
      case(_) { 
        // return error invalid message id
        return #err("Invalid message id");
      };
    };
  };

  public shared({caller}) func updateComment(messageId : Nat, commentId : Nat, comment : Text) : async Result.Result<(), Text> {
    let msg : ?Message = messageHash.get(messageId);
    switch(msg) {
      case(?msg) {  
        let tempComm = Buffer.fromArray<Comment>(msg.comments);
        let c = tempComm.getOpt(commentId);
        switch(c) {
          case(?c) {  
            if(Principal.equal(c.creator, caller)) {
              tempComm.put(commentId, {creator = caller; text=comment; createdAt = c.createdAt; updatedAt = ?Time.now()});
              messageHash.put(messageId, {comments = Buffer.toArray(tempComm); content = msg.content; creator = msg.creator; text = msg.text; vote = msg.vote; createdAt = msg.createdAt; updatedAt = msg.updatedAt});
              return #ok()
            } else {
              return #err("Only the creator itself or an admin can delete this comment.")
            }
          };
          case(_) { 
            return #err("Comment not found or invalid id.")
          };
        };
      };
      case(_) { 
        return #err("Message not found or invalid id.")
      };
    };
  };

  public shared({caller}) func deleteComment(commentId : Nat, messageId : Nat) : async (Result.Result<(), Text>) {
    let msg : ?Message = messageHash.get(messageId);
    switch(msg) {
      case(?msg) {  
        // let comment : ?Comment =  commentHash.remove(commentId);
        let commTemp = Buffer.fromArray<Comment>(msg.comments);
        let comment = commTemp.getOpt(commentId);
        switch(comment) {
          case(?comment) { 
            if (Principal.equal(caller, comment.creator) or _User.isAdmin(adminBuffer, caller)) {
              messageHash.put(messageId, _Message.removeComment(msg, commentId));
              return #ok();
            } else {
              return #err("Only the creator itself or an admin can delete the comment.")
            }
          };
          case(_) { 
            return #err("Invalid comment id.")
          };
        };
      };
      case(_) { 
        return #err("Invalid message id.");
      };
    };
  };

  // public query func getComment(messageId:Nat) : async Result.Result<[.Comment], Text> {
  //   let msg : ?Message = messageHash.get(messageId);
  //   var commBuff = Buffer.Buffer<Comment>(1);
  //   switch(msg) {
  //     case(?msg) {
  //       return #ok(msg.comments)
  //     };
  //     case(_) { 
  //       // return error invalid message id
  //       return #err("Invalid message Id")
  //     };
  //   };
  // };

  public query func getAllComment(messageId : Nat) : async Result.Result<[Response.Comment], Text> {
    let msg : ?Message = messageHash.get(messageId);
    switch(msg) {
      case(?msg) {  
        let commBuff = Buffer.fromArray<Comment>(msg.comments);
        let resComm = Buffer.Buffer<Response.Comment>(1);
        var index : Nat = 0;
        for(item in msg.comments.vals()) {
          let u = _User.get(userHash, msg.comments[index].creator);
          switch(u) {
            case(?u) {  
              resComm.add({id = Nat.toText(index); comment = item; creator = u})
            };
            case(_) { };
          };
          index += 1;
        };
        return #ok(Buffer.toArray(resComm));
      };
      case(_) { 
        return #err("Message with id " # Nat.toText(messageId) #  " does not exist.");
      };
    };
  };

  // User functions
  public func addUser(n:Text, p:Principal, i:Blob) : async (Result.Result<(), Text>) {
    if (not enReg) return #err("Registration is disabled");
    if (Principal.isAnonymous(p)) return #err("Anonymous user is not allowed to register");
    let s = userHash.size();
    userHash.put(p, {name = n ; allowMsg = true; image=i});
    return #ok();
  };

  public query func getUser(p : ?Principal) : async Result.Result<User, Text> {
    switch(p) {
      case(?p) {  
        let u : ?User = userHash.get(p);
        switch(u) {
          case(?u) {  
            return #ok(u)
          };
          case(_) { 
            return #err("User not found")
          };
        };
      };
      case(_) { 
        return #err("Missing principal.")
      };
    };
  };


  // Admin functions
  public func adminEnReg(b:Bool) : async () {
    enReg := b;
  };

  system func preupgrade() {
    for ((key, value) in messageHash.entries()) {
      messageList := List.push<Type.MessageList>({key = key; value = value}, null)
    };

    for ((key, value) in userHash.entries()) {
      userList := List.push<Type.UserList>({key = key; value = value}, null)
    };
    Debug.print("preupgrade");
  };

  system func postupgrade() {
    loop {
      let m = List.pop<Type.MessageList>(messageList);
      messageList := m.1;
      switch(m.0) {
        case(?m) {  
          messageHash.put(m.key, m.value);
        };
        case(_) {   

        };
      };
    } while not List.isNil<Type.MessageList>(messageList);

    loop {
      let m = List.pop<Type.UserList>(userList);
      userList := m.1;
      switch(m.0) {
        case(?m) {  
          userHash.put(m.key, m.value);
        };
        case(_) {   
          
        };
      };
    } while not List.isNil<Type.UserList>(userList);

    messageRanked := _Message.ranked(messageHash, userHash);
    // postCount := 0;
  }
};
