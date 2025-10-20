import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export function useStateObject(object: any) {
  const [state, setState] = useState(object);
  function setter(key: string, value: any) {
    setState({ ...state, [key]: value });
  }
  return [state, setter];
}

export function useStateContext() {
  return useOutletContext<[any, Function]>();
}