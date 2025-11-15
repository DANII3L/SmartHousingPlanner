export const mapSnapshot = (snapshot) =>
  snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));

export const sortByTimestamp = (items, fields = ['updatedAt', 'createdAt']) =>
  [...items].sort((a, b) => {
    const getTime = (entry) => {
      for (const field of fields) {
        if (entry[field]) {
          return new Date(entry[field]).getTime();
        }
      }
      return 0;
    };
    return getTime(b) - getTime(a);
  });

export const chunkArray = (source = [], chunkSize = 10) => {
  const result = [];
  for (let i = 0; i < source.length; i += chunkSize) {
    result.push(source.slice(i, i + chunkSize));
  }
  return result;
};

