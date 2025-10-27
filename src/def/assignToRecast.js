export function lightAssign(target, ...sources) {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    });
  });
}
