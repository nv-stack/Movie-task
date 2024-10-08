export default function(mainContainer, movieCardClass) {
  function getComputedStyleOfContainer() {
    return getComputedStyle(mainContainer);
  }

  function getContainerDimensions(computedStyle) {
    return {
      containerPaddingLeft: parseFloat(computedStyle.paddingLeft),
      containerPaddingRight: parseFloat(computedStyle.paddingRight),
      gap: computedStyle.gap,
    };
  }

  function getMovieCardDimensions() {
    return mainContainer.querySelector(`.${movieCardClass}`).getBoundingClientRect().width;
  }

  function getContainerWidth() {
    return mainContainer.getBoundingClientRect().width;
  }

  return {
    getComputedStyleOfContainer,
    getContainerDimensions,
    getMovieCardDimensions,
    getContainerWidth,
  };
}
