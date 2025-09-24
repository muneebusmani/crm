--
-- PostgreSQL database dump
--

\restrict dg6rhG84FNcsIhWkjXr43d7KH6u0dM5Fc97P7gIpcJZP55IOEiq38sSN8DcuGp8

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_status_enum AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'IN_ACTIVE'
);


ALTER TYPE public.user_status_enum OWNER TO postgres;

--
-- Name: user_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_type_enum AS ENUM (
    'admin',
    'dealer'
);


ALTER TYPE public.user_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    action character varying NOT NULL,
    description text,
    user_id integer,
    entity character varying,
    entity_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "roleId" integer,
    role character varying NOT NULL
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- Name: admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_id_seq OWNER TO postgres;

--
-- Name: admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_id_seq OWNED BY public.admin.id;


--
-- Name: admin_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_role (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.admin_role OWNER TO postgres;

--
-- Name: admin_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_role_id_seq OWNER TO postgres;

--
-- Name: admin_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_role_id_seq OWNED BY public.admin_role.id;


--
-- Name: dealer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "tierId" integer,
    name character varying NOT NULL,
    owner character varying NOT NULL,
    location character varying NOT NULL,
    logo character varying NOT NULL,
    website character varying NOT NULL,
    "contactEmail" character varying NOT NULL,
    "tierName" integer
);


ALTER TABLE public.dealer OWNER TO postgres;

--
-- Name: dealer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dealer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dealer_id_seq OWNER TO postgres;

--
-- Name: dealer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dealer_id_seq OWNED BY public.dealer.id;


--
-- Name: dealer_leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_leads (
    id integer NOT NULL,
    status character varying DEFAULT 'open'::character varying NOT NULL,
    "userId" integer,
    "leadId" integer
);


ALTER TABLE public.dealer_leads OWNER TO postgres;

--
-- Name: dealer_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dealer_leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dealer_leads_id_seq OWNER TO postgres;

--
-- Name: dealer_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dealer_leads_id_seq OWNED BY public.dealer_leads.id;


--
-- Name: dealer_tier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dealer_tier (
    id integer NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.dealer_tier OWNER TO postgres;

--
-- Name: dealer_tier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dealer_tier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dealer_tier_id_seq OWNER TO postgres;

--
-- Name: dealer_tier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dealer_tier_id_seq OWNED BY public.dealer_tier.id;


--
-- Name: lead_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_messages (
    id integer NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "dealerId" integer,
    "leadId" integer
);


ALTER TABLE public.lead_messages OWNER TO postgres;

--
-- Name: lead_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lead_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lead_messages_id_seq OWNER TO postgres;

--
-- Name: lead_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lead_messages_id_seq OWNED BY public.lead_messages.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    vehicle_model character varying,
    vehicle_reg character varying,
    vehicle_brand character varying,
    vehicle_title character varying,
    vehicle_vrm character varying,
    vehicle_series character varying,
    vehicle_part character varying,
    engin_capacity character varying,
    "fuelType" character varying,
    part_supplied character varying,
    supply_only character varying,
    consider_both character varying,
    reconditioned_condition character varying,
    used_condition character varying,
    new_condition character varying,
    consider_all_condition character varying,
    postcode character varying,
    vehicle_drive character varying,
    collection_required character varying,
    email character varying,
    name character varying,
    description text,
    engine_code character varying,
    source character varying,
    status character varying,
    assigned_to character varying,
    follow_up_date timestamp without time zone,
    notes text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.leads OWNER TO postgres;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leads_id_seq OWNER TO postgres;

--
-- Name: leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leads_id_seq OWNED BY public.leads.id;


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id integer NOT NULL,
    "engineCodeName" character varying NOT NULL,
    "dealershipName" character varying NOT NULL,
    "quotationPrice" numeric(10,2) NOT NULL,
    subject character varying NOT NULL,
    message text NOT NULL,
    "dealerId" integer,
    "leadId" integer
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: quotations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quotations_id_seq OWNER TO postgres;

--
-- Name: quotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quotations_id_seq OWNED BY public.quotations.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    name character varying NOT NULL,
    username character varying NOT NULL,
    type public.user_type_enum DEFAULT 'dealer'::public.user_type_enum NOT NULL,
    status public.user_status_enum DEFAULT 'ACTIVE'::public.user_status_enum NOT NULL,
    "resetPasswordToken" character varying(255),
    "resetPasswordExpires" timestamp with time zone
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: admin id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin ALTER COLUMN id SET DEFAULT nextval('public.admin_id_seq'::regclass);


--
-- Name: admin_role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role ALTER COLUMN id SET DEFAULT nextval('public.admin_role_id_seq'::regclass);


--
-- Name: dealer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer ALTER COLUMN id SET DEFAULT nextval('public.dealer_id_seq'::regclass);


--
-- Name: dealer_leads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_leads ALTER COLUMN id SET DEFAULT nextval('public.dealer_leads_id_seq'::regclass);


--
-- Name: dealer_tier id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_tier ALTER COLUMN id SET DEFAULT nextval('public.dealer_tier_id_seq'::regclass);


--
-- Name: lead_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_messages ALTER COLUMN id SET DEFAULT nextval('public.lead_messages_id_seq'::regclass);


--
-- Name: leads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads ALTER COLUMN id SET DEFAULT nextval('public.leads_id_seq'::regclass);


--
-- Name: quotations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations ALTER COLUMN id SET DEFAULT nextval('public.quotations_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, action, description, user_id, entity, entity_id, created_at) FROM stdin;
1	CREATE_LEAD	Created lead (Civic)	0	Lead	2	2025-09-22 15:27:57.400185
2	CREATE_LEAD	Created lead (Civic)	0	Lead	3	2025-09-22 15:28:25.700454
3	CREATE_LEAD	Created lead (Civic)	0	Lead	4	2025-09-22 15:28:41.567663
4	CREATE_LEAD	Created lead (Civic)	0	Lead	5	2025-09-22 15:29:34.028032
5	CREATE_LEAD	Created lead (Civic)	0	Lead	6	2025-09-22 15:42:20.721886
6	CREATE_LEAD	Created lead (Civic)	0	Lead	7	2025-09-22 19:14:29.025362
7	CREATE_LEAD	Created lead (Civic)	0	Lead	8	2025-09-22 19:51:26.702345
8	CREATE_LEAD	Created lead (Civic)	0	Lead	9	2025-09-22 19:52:35.846926
9	CREATE_LEAD	Created lead (Civic)	0	Lead	10	2025-09-24 01:14:43.651874
\.


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (id, "userId", "roleId", role) FROM stdin;
\.


--
-- Data for Name: admin_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_role (id, name) FROM stdin;
\.


--
-- Data for Name: dealer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer (id, "userId", "tierId", name, owner, location, logo, website, "contactEmail", "tierName") FROM stdin;
1	4	1	John Motor	John Doe	London, UK	http://localhost:3001/uploads/logo.jpg	johnmotors.co.uk	contact@johnmotors.co.uk	1
3	6	1	John Doe	John Doe	John Doe	http://localhost:3001/uploads/logo.jpg	vJohn Doe	JohnDoe@gmail.com	1
2	5	1	Usmani Motors	Muneeb Usmani	London, UK	http://localhost:3001/uploads/logo.jpeg	sidhupaaji.com	muneebusmani8355@gmail.com	1
\.


--
-- Data for Name: dealer_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_leads (id, status, "userId", "leadId") FROM stdin;
\.


--
-- Data for Name: dealer_tier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_tier (id, name) FROM stdin;
1	Gold
2	Silver
3	Platinum
4	Bronze
\.


--
-- Data for Name: lead_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_messages (id, content, "createdAt", "dealerId", "leadId") FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, vehicle_model, vehicle_reg, vehicle_brand, vehicle_title, vehicle_vrm, vehicle_series, vehicle_part, engin_capacity, "fuelType", part_supplied, supply_only, consider_both, reconditioned_condition, used_condition, new_condition, consider_all_condition, postcode, vehicle_drive, collection_required, email, name, description, engine_code, source, status, assigned_to, follow_up_date, notes, "createdAt", "updatedAt", is_deleted) FROM stdin;
9	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	user@example.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-22 19:52:35.840304	2025-09-22 19:52:35.840304	f
10	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	user@example.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-24 01:14:43.635571	2025-09-24 01:14:43.635571	f
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, "engineCodeName", "dealershipName", "quotationPrice", subject, message, "dealerId", "leadId") FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, password, name, username, type, status, "resetPasswordToken", "resetPasswordExpires") FROM stdin;
6	JohnDoe@gmail.com	$2b$10$y4okXoojTsIgaWYcOfU3du8wCppaWWzAUtlgdg/gar6l9Uz18rdRC	John Doe	John Doe	dealer	ACTIVE	\N	\N
4	john@enginefinderscrm.com	$2b$10$FrvBAvcwAONWgQeSGco5d.MuUslcKF6/yvK0ye1GOsoZmI/1utu3G	John Motor	johndoe	dealer	ACTIVE	\N	\N
5	muneebusmani8355@gmail.com	$2b$10$OrYCTeR3CSYbsCQp.GubF.A.S1WEan2A9DmfztSLseb.G.CHOUSoO	Ali Chandio Motors	muneeb	dealer	ACTIVE	\N	\N
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 9, true);


--
-- Name: admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_id_seq', 1, false);


--
-- Name: admin_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_role_id_seq', 1, false);


--
-- Name: dealer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dealer_id_seq', 4, true);


--
-- Name: dealer_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dealer_leads_id_seq', 2, true);


--
-- Name: dealer_tier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dealer_tier_id_seq', 4, true);


--
-- Name: lead_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lead_messages_id_seq', 1, false);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leads_id_seq', 10, true);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotations_id_seq', 1, false);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 7, true);


--
-- Name: dealer PK_1bd6073e224f6c22ff1d5827add; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer
    ADD CONSTRAINT "PK_1bd6073e224f6c22ff1d5827add" PRIMARY KEY (id);


--
-- Name: dealer_leads PK_43ec3415cba24216fa59fb6ca03; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_leads
    ADD CONSTRAINT "PK_43ec3415cba24216fa59fb6ca03" PRIMARY KEY (id);


--
-- Name: quotations PK_6c00eb8ba181f28c21ffba7ecb1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "PK_6c00eb8ba181f28c21ffba7ecb1" PRIMARY KEY (id);


--
-- Name: dealer_tier PK_90a786ef06e62bf10c8e54e7bc1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_tier
    ADD CONSTRAINT "PK_90a786ef06e62bf10c8e54e7bc1" PRIMARY KEY (id);


--
-- Name: lead_messages PK_a677e52e46c9b2b8643cb132749; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_messages
    ADD CONSTRAINT "PK_a677e52e46c9b2b8643cb132749" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: leads PK_cd102ed7a9a4ca7d4d8bfeba406; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY (id);


--
-- Name: admin PK_e032310bcef831fb83101899b10; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY (id);


--
-- Name: activity_logs PK_f25287b6140c5ba18d38776a796; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "PK_f25287b6140c5ba18d38776a796" PRIMARY KEY (id);


--
-- Name: admin_role PK_fd32421f2d93414e46a8fcfd86b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role
    ADD CONSTRAINT "PK_fd32421f2d93414e46a8fcfd86b" PRIMARY KEY (id);


--
-- Name: admin_role UQ_64731f1d2dc5072a911fd206ac3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_role
    ADD CONSTRAINT "UQ_64731f1d2dc5072a911fd206ac3" UNIQUE (name);


--
-- Name: user UQ_78a916df40e02a9deb1c4b75edb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username);


--
-- Name: dealer UQ_7c2e500551158a2e30b129d3c79; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer
    ADD CONSTRAINT "UQ_7c2e500551158a2e30b129d3c79" UNIQUE ("userId");


--
-- Name: dealer_tier UQ_d00410384732e55045dc3cff89e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_tier
    ADD CONSTRAINT "UQ_d00410384732e55045dc3cff89e" UNIQUE (name);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: admin UQ_f8a889c4362d78f056960ca6dad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "UQ_f8a889c4362d78f056960ca6dad" UNIQUE ("userId");


--
-- Name: admin FK_446fb0cc55eed0065ececcc889b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "FK_446fb0cc55eed0065ececcc889b" FOREIGN KEY ("roleId") REFERENCES public.admin_role(id);


--
-- Name: dealer FK_7c2e500551158a2e30b129d3c79; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer
    ADD CONSTRAINT "FK_7c2e500551158a2e30b129d3c79" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: quotations FK_851f6afeab607c8a401432f9d05; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "FK_851f6afeab607c8a401432f9d05" FOREIGN KEY ("dealerId") REFERENCES public."user"(id);


--
-- Name: dealer_leads FK_8b9789c151d0eaf3405d73e4d20; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_leads
    ADD CONSTRAINT "FK_8b9789c151d0eaf3405d73e4d20" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: lead_messages FK_b9a3395661b9a72350a663c135f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_messages
    ADD CONSTRAINT "FK_b9a3395661b9a72350a663c135f" FOREIGN KEY ("leadId") REFERENCES public.leads(id);


--
-- Name: quotations FK_bb2986715a3551d376a5c68517d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "FK_bb2986715a3551d376a5c68517d" FOREIGN KEY ("leadId") REFERENCES public.leads(id);


--
-- Name: dealer FK_c78c087e8d81618f4c1d828c285; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer
    ADD CONSTRAINT "FK_c78c087e8d81618f4c1d828c285" FOREIGN KEY ("tierName") REFERENCES public.dealer_tier(id);


--
-- Name: dealer_leads FK_ee2978b96dbc37a14228e205230; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dealer_leads
    ADD CONSTRAINT "FK_ee2978b96dbc37a14228e205230" FOREIGN KEY ("leadId") REFERENCES public.leads(id);


--
-- Name: admin FK_f8a889c4362d78f056960ca6dad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: lead_messages FK_f97b528b624a3949ee0d880c1f9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_messages
    ADD CONSTRAINT "FK_f97b528b624a3949ee0d880c1f9" FOREIGN KEY ("dealerId") REFERENCES public."user"(id);


--
-- PostgreSQL database dump complete
--

\unrestrict dg6rhG84FNcsIhWkjXr43d7KH6u0dM5Fc97P7gIpcJZP55IOEiq38sSN8DcuGp8

