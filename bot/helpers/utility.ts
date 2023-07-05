export const randomInt = (min: number, max: number) => {
  // random in range [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min
}
