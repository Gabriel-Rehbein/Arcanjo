let loadingHandlers = {
  startLoading: null,
  stopLoading: null,
};

export function setLoadingHandlers({ startLoading, stopLoading }) {
  loadingHandlers = { startLoading, stopLoading };
}

export function clearLoadingHandlers() {
  loadingHandlers = { startLoading: null, stopLoading: null };
}

export function startLoading() {
  loadingHandlers.startLoading?.();
}

export function stopLoading() {
  loadingHandlers.stopLoading?.();
}
