--
-- PostgreSQL database dump
--

-- Dumped from database version 14.11
-- Dumped by pg_dump version 14.13 (Ubuntu 14.13-0ubuntu0.22.04.1)

-- Started on 2024-09-11 18:23:25 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 99739)
-- Name: Permission; Type: TABLE; Schema: public; Owner: testuser
--

CREATE TABLE public."Permission" (
    "permissionId" integer NOT NULL,
    "roleId" integer NOT NULL,
    action character varying NOT NULL,
    subject character varying NOT NULL,
    inverted boolean DEFAULT false NOT NULL,
    conditions jsonb,
    reason text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public."Permission" OWNER TO testuser;

--
-- TOC entry 225 (class 1259 OID 99738)
-- Name: Permission_permissionId_seq; Type: SEQUENCE; Schema: public; Owner: testuser
--

CREATE SEQUENCE public."Permission_permissionId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Permission_permissionId_seq" OWNER TO testuser;

--
-- TOC entry 3431 (class 0 OID 0)
-- Dependencies: 225
-- Name: Permission_permissionId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: testuser
--

ALTER SEQUENCE public."Permission_permissionId_seq" OWNED BY public."Permission"."permissionId";


--
-- TOC entry 224 (class 1259 OID 99731)
-- Name: Role; Type: TABLE; Schema: public; Owner: testuser
--

CREATE TABLE public."Role" (
    "roleId" integer NOT NULL,
    name character varying NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public."Role" OWNER TO testuser;

--
-- TOC entry 223 (class 1259 OID 99730)
-- Name: Role_roleId_seq; Type: SEQUENCE; Schema: public; Owner: testuser
--

CREATE SEQUENCE public."Role_roleId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Role_roleId_seq" OWNER TO testuser;

--
-- TOC entry 3432 (class 0 OID 0)
-- Dependencies: 223
-- Name: Role_roleId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: testuser
--

ALTER SEQUENCE public."Role_roleId_seq" OWNED BY public."Role"."roleId";


--
-- TOC entry 3277 (class 2604 OID 99742)
-- Name: Permission permissionId; Type: DEFAULT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public."Permission" ALTER COLUMN "permissionId" SET DEFAULT nextval('public."Permission_permissionId_seq"'::regclass);


--
-- TOC entry 3275 (class 2604 OID 99734)
-- Name: Role roleId; Type: DEFAULT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public."Role" ALTER COLUMN "roleId" SET DEFAULT nextval('public."Role_roleId_seq"'::regclass);


--
-- TOC entry 3425 (class 0 OID 99739)
-- Dependencies: 226
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: testuser
--

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


--
-- TOC entry 3423 (class 0 OID 99731)
-- Dependencies: 224
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: testuser
--

COPY public."Role" ("roleId", name, "createdAt", "deletedAt") FROM stdin;
1	Admin	2024-09-11 16:08:50.695	\N
2	User	2024-09-11 16:08:50.699	\N
3	Guest	2024-09-11 16:08:50.701	\N
\.


--
-- TOC entry 3433 (class 0 OID 0)
-- Dependencies: 225
-- Name: Permission_permissionId_seq; Type: SEQUENCE SET; Schema: public; Owner: testuser
--

SELECT pg_catalog.setval('public."Permission_permissionId_seq"', 1, false);


--
-- TOC entry 3434 (class 0 OID 0)
-- Dependencies: 223
-- Name: Role_roleId_seq; Type: SEQUENCE SET; Schema: public; Owner: testuser
--

SELECT pg_catalog.setval('public."Role_roleId_seq"', 1, false);


--
-- TOC entry 3281 (class 1259 OID 99767)
-- Name: Permission_permissionId_key; Type: INDEX; Schema: public; Owner: testuser
--

CREATE UNIQUE INDEX "Permission_permissionId_key" ON public."Permission" USING btree ("permissionId");


--
-- TOC entry 3280 (class 1259 OID 99766)
-- Name: Role_roleId_key; Type: INDEX; Schema: public; Owner: testuser
--

CREATE UNIQUE INDEX "Role_roleId_key" ON public."Role" USING btree ("roleId");


--
-- TOC entry 3282 (class 2606 OID 99774)
-- Name: Permission Permission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: testuser
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"("roleId") ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2024-09-11 18:23:25 CEST

--
-- PostgreSQL database dump complete
--

