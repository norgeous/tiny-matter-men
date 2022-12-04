export const collisionCategories = {
  default:          0b00000000000000000000000000000001, // 1 (the default category) midground
  entity1:          0b00000000000000000000000000000010, // 2
  entity2:          0b00000000000000000000000000000100, // 4
  // foreground:       0b00000000000000000000000000001000, // 8
  // ...
  layer32:          0b10000000000000000000000000000000, // 2147483648 (32 max layer)
};

// 4294967295 a mask of everything, the default mask
export const collisionMaskEverything = 0b11111111111111111111111111111111;