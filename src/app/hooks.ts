// This file serves as a central hub for re-exporting pre-typed Redux hooks.
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, AppStore } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<AppStore>();
