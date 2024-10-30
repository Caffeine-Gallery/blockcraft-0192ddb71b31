import Error "mo:base/Error";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Result "mo:base/Result";

actor {
    type LayoutItem = {
        type_: Text;
        content: Text;
        left: Text;
        top: Text;
        width: Text;
        height: Text;
        styles: {
            color: Text;
            backgroundColor: Text;
            fontSize: Text;
        };
    };

    stable var savedLayout: [LayoutItem] = [];

    public func saveLayout(layout: [LayoutItem]) : async Result.Result<Text, Text> {
        Debug.print("Saving layout...");
        try {
            savedLayout := layout;
            #ok("Layout saved successfully")
        } catch (e) {
            #err("Error saving layout: " # Error.message(e))
        }
    };

    public query func loadLayout() : async [LayoutItem] {
        Debug.print("Loading layout...");
        savedLayout
    };
}
