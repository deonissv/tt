COPY public."Role" ("roleId", name, "createdAt", "deletedAt") FROM stdin;
1	Admin	2024-09-11 16:08:50.695	\N
2	User	2024-09-11 16:08:50.699	\N
3	Guest	2024-09-11 16:08:50.701	\N
\.


COPY public."Permission" ("permissionId", "roleId", action, subject, inverted, conditions, reason, "createdAt", "deletedAt") FROM stdin;
0	1	manage	all	f	\N	\N	2024-09-11 16:08:50.703	\N
1	2	create	Game	f	\N	\N	2024-09-11 16:08:50.706	\N
2	2	read	Game	f	\N	\N	2024-09-11 16:08:50.709	\N
3	2	update	Game	f	{"authorId": "${ userId }"}	\N	2024-09-11 16:08:50.711	\N
4	2	delete	Game	f	{"authorId": "${ userId }"}	\N	2024-09-11 16:08:50.713	\N
5	3	read	Game	f	\N	\N	2024-09-11 16:08:50.716	\N
6	2	create	User	f	\N	\N	2024-09-11 16:08:50.718	\N
7	2	read	User	f	\N	\N	2024-09-11 16:08:50.72	\N
8	2	update	User	f	{"userId": "${ userId }"}	\N	2024-09-11 16:08:50.722	\N
9	2	delete	User	f	{"userId": "${ userId }"}	\N	2024-09-11 16:08:50.724	\N
10	3	read	User	f	\N	\N	2024-09-11 16:08:50.726	\N
11	2	create	Room	f	\N	\N	2024-09-11 16:08:50.727	\N
12	2	read	Room	f	\N	\N	2024-09-11 16:08:50.729	\N
13	2	delete	Room	f	{"creatorId": "${ userId }"}	\N	2024-09-11 16:08:50.731	\N
14	3	read	Room	f	\N	\N	2024-09-11 16:08:50.733	\N
\.


