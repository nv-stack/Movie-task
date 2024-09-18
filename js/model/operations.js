function removeDuplicates(data) {
  const map = new Map();
  data.forEach((item) => {
    if (!map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values());
}

const sortByImdbRating = (data) => {
  const imdbRating = (ratings) => {
    const foundRating = ratings.find((rating) => rating.id === "imdb");
    return foundRating ? foundRating.rating : 0;
  };
  return data.sort((a, b) => imdbRating(b.ratings) - imdbRating(a.ratings));
};

export { removeDuplicates, sortByImdbRating };

