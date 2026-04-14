alter table favorites
  add constraint favorites_user_book_unique unique (user_id, ol_key);
