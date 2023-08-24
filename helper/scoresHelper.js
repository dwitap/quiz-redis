const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Generate a random index between 0 and i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at i and j
  }
  return array;
};

const calculateScore = (timeB, score) => {
  const time = 86400 - timeB;
  switch (true) {
    case time <= 10:
      score += 10;
      break;
    case time <= 20:
      score += 9;
      break;
    case time <= 30:
      score += 8;
      break;
    case time <= 40:
      score += 7;
      break;
    case time <= 50:
      score += 6;
      break;
    case time <= 60:
      score += 5;
      break;
    case time > 60:
      score = 0;
      break;
    default:
      break;
  }
  return score;
};

module.exports = {
  shuffleArray,
  calculateScore,
};
