export interface RequestCallbacks {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

export interface ResultCallbacks<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}
