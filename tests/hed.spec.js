const assert = require("assert");
const validate = require("../index");

describe("HED Tags", function() {
  it("should comprise valid comma-separated paths", function() {
    const tag =
      "Event/Category/Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple";
    const result = validate.HED.validateHedTags(tag);
    assert(result === true);
  });

  it("should not have invalid paths", function() {
    const tag =
      "Event/Category|Experimental stimulus,Item/Object/Vehicle/Train,Attribute/Visual/Color/Purple";
    const result = validate.HED.validateHedTags(tag);
    assert(result === false);
  });
});
