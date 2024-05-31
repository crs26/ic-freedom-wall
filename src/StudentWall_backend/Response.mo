import Type "Types"
module {
    public type Message = {
        id : Text;
        message : Type.Message;
        creator : Type.User;
    };

    public type Comment = {
        id : Text;
        comment : Type.Comment;
        creator : Type.User;
    }
}