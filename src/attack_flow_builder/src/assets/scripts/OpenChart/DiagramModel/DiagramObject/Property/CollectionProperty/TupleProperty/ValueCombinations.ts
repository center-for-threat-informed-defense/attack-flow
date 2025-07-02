/**
 * Valid Tuple Value Combinations.
 * @remarks
 *  A map which associates valid value combinations.
 * @example
 *  // Example with three fields: animal, sound, volume
 *  [
 *    // [field1, value, field2, value]
 *    ["animal", "dog", "sound", "bark!"],
 *    ["animal", "dog", "sound", "woof!"],
 *    ["animal", "cat", "sound", "meow"],
 *    ["animal", "cat", "sound", "purr"],
 *    ["animal", "dog", "volume", "loud"],
 *    ["animal", "cat", "volume", "quiet"],
 *    ["sound", "bark!", "volume", "loud"],
 *    ["sound", "woof!", "volume", "loud"],
 *    ["sound", "meow", "volume", "quiet"],
 *    ["sound", "purr", "volume", "quiet"],
 *  ]
 *  // Relationships are assumed to be bi-directional.
 *  // The following is not necessary:
 *  [
 *    ["animal", "dog", "sound", "bark!"],
 *    ["sound", "bark!", "animal", "dog"],
 *  ]
 */
export type ValueCombinations = [string, string, string, string][];
