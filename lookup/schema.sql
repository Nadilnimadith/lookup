create table if not exists users(
 id bigserial primary key,
 name varchar(30) not null,
 handle varchar(32) unique not null,
 email varchar(320) unique not null,
 phone varchar(32),
 bio text default 'Welcome to LOOK UP',
 avatar text,
 google_sub varchar(255) unique,
 created_at timestamptz default now()
);
create table if not exists email_codes(
 id bigserial primary key,
 email varchar(320) not null,
 code_hash varchar(64) not null,
 mode varchar(16) not null,
 expires_at timestamptz not null,
 used boolean default false,
 created_at timestamptz default now()
);
create index if not exists email_codes_lookup on email_codes(email,used,expires_at);
create table if not exists follows(
 follower_id bigint references users(id) on delete cascade,
 following_id bigint references users(id) on delete cascade,
 created_at timestamptz default now(),
 primary key(follower_id,following_id),
 check(follower_id<>following_id)
);
create table if not exists posts(
 id bigserial primary key,
 user_id bigint references users(id) on delete cascade,
 image_url text,
 caption text,
 created_at timestamptz default now()
);
