import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addNewPost } from './postsSlice';
import { selectCurrentUsername } from '../auth/authSlice';
import { useAddNewPostMutation } from '../api/apiSlice';

interface AddPostFormFields extends HTMLFormControlsCollection {
  postTitle: HTMLInputElement;
  postContent: HTMLTextAreaElement;
}

interface AddPostFormElements extends HTMLFormElement {
  readonly elements: AddPostFormFields;
}

export default function AddPostForm() {
  const [addNewPost, { isLoading }] = useAddNewPostMutation();

  const userId = useAppSelector(selectCurrentUsername);

  // console.log(users);

  async function handleSubmit(e: React.FormEvent<AddPostFormElements>) {
    e.preventDefault();

    const { elements } = e.currentTarget;
    const title = elements.postTitle.value;
    const content = elements.postContent.value;
    // const userId = elements.postAuthor.value;

    const form = e.currentTarget;

    try {
      await addNewPost({ title, content, user: userId }).unwrap();

      form.reset();
    } catch (err) {
      console.error('Failed to save this post: ', err);
    }
  }

  // const usersOptions = users.map((user) => (
  //   <option key={user.id} value={user.id}>
  //     {user.name}
  //   </option>
  // ));

  return (
    <section>
      <h2>Add a New Post</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input type="text" id="postTitle" defaultValue="" required />

        {/* <select id="postAuthor" name="postAuthor" required>
          <option value=""></option>
          {usersOptions}
        </select> */}

        <label htmlFor="postContent">Content:</label>
        <textarea id="postContent" name="postContent" defaultValue="" required />

        <button disabled={isLoading}>Save Post</button>
      </form>
    </section>
  );
}
