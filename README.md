# Redux Essentials Tutorial Example

This project contains the setup and code from the "Redux Essentials" tutorial example app in the Redux docs ( https://redux.js.org/tutorials/essentials/part-3-data-flow ).

The `master` branch has a single commit that already has the initial project configuration in place. You can use this as the starting point to follow along with the instructions from the tutorial.

The `tutorial-steps-ts` branch has the actual code commits from the tutorial. You can look at these to see how the official tutorial actually implements each piece of functionality along the way.

This project was bootstrapped with [Vite](https://vitejs.dev/), and is based on the [official Redux Toolkit + Vite template](https://github.com/reduxjs/redux-templates/tree/master/packages/vite-template-redux).

## Package Managers

This project is currently set up to use [Yarn 4](https://yarnpkg.com/getting-started/usage) as the package manager.

If you prefer to use another package manager, such as NPM, PNPM, or Bun, delete the `"packageManager"` section from `package.json` and the `.yarnrc.yml` and `yarn.lock` files, then install dependencies with your preferred package manager.

## Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.<br />
Open [http://localhost:4173](http://localhost:4173) to view it in the browser.

The page will reload if you make edits.<br />

### `yarn build`

Builds the app for production to the `dist` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

## Learn More

You can learn more about building and deploying in the [Vite docs](https://vitejs.dev/).

To learn React, check out the [React documentation](https://react.dev).

<!-- Main docs -->

# Steps of Creating Store and slice (Rough work)

# Configure Store

#### File - store.js

```
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
    reducer: {
        field_name: slice_reducer,
        posts: postReducer
    }
});
```

# Create Slice

#### File - postSlice.js

```
import { createSlice } from '@reduxjs/toolkit';

const initialState = {posts: []};

const postSlice = createSlice({
    name: posts,
    initialState,
    reducers: {},

    // Param1 - reducer action happened of other slice (listening to action happen somewhere else).
    // Param2 - reducer function (to update the current slice state)
    extraReducers: builder => {
        builder.addCase(Param1, Param2).addMatcher(Param1, Param2).addDefaultCase(Param1, Param2)
    },

    selectors: {}
});

export const {actionCreators} = postSlice.actions;
export const { selectors } = postSlice.selectors;
export default postSlice.reducer;
```

# Redux-Thunk function

```
function logAndAdd(amount) {
    return async function (dispatch, getState) {
        const stateBefore = getState();
        console.log(`Counter before: ${stateBefore.counter}`);

        dispatch(incrementByAmount(amount));

        const stateAfter = getState();
        console.log(`Counter after: ${stateAfter.counter}`);
    }
}

store.dispatch(logAndAdd(5));
```

# createAsyncThunk() function - (ReduxToolkit API method)

Redux Toolkit provides a createAsyncThunk API to implement the creation and dispatching of actions describing an async request.

#### File - usersSlice.js

```
import { createAsyncThunk } from '@reduxjs/toolkit';

// 1) Create asyncThunk.
// Param1 - endpoint to fetch data from
// Param2 - reducer callback
export const fetchUsers = createAsyncThunk('fetch/users', async () => {
  const response = await someHttpRequest('/fakeApi/users');

  return response.data;
});

// 2) Include it on extraReducers field in createSlice()
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});


// 3) Dispatch it in the Component by importing fetchUsers() and dispatch it like store.dispatch(fetchUsers()) in component
```
