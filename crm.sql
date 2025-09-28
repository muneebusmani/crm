--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.5

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


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
-- Name: bank_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_details (
    id integer NOT NULL,
    "accountHolderName" character varying(100) NOT NULL,
    "accountNumber" character varying(50) NOT NULL,
    "bankName" character varying(50) NOT NULL,
    "branchName" character varying(50) NOT NULL,
    "ifscCode" character varying(20),
    iban character varying(50),
    "swiftCode" character varying(20),
    "userId" integer
);


ALTER TABLE public.bank_details OWNER TO postgres;

--
-- Name: bank_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_details_id_seq OWNER TO postgres;

--
-- Name: bank_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_details_id_seq OWNED BY public.bank_details.id;


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
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "invoiceId" uuid NOT NULL,
    "productName" character varying NOT NULL,
    "productDetails" text DEFAULT ''::text NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    quantity integer NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "invoiceNumber" character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    "subTotal" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "totalAmount" numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "grandTotal" integer NOT NULL,
    "userId" integer,
    "leadId" integer
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: lead_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_messages (
    id integer NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "dealerId" integer,
    "leadId" integer,
    type character varying DEFAULT 'message'::character varying NOT NULL
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
-- Name: bank_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_details ALTER COLUMN id SET DEFAULT nextval('public.bank_details_id_seq'::regclass);


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
10	CREATE_LEAD	Created lead (Civic)	0	Lead	11	2025-09-24 13:42:43.359674
11	CREATE_LEAD	Created lead (Civic)	0	Lead	12	2025-09-24 13:42:46.11603
12	CREATE_LEAD	Created lead (Civic)	0	Lead	13	2025-09-25 13:24:02.9527
13	CREATE_LEAD	Created lead (Civic)	0	Lead	14	2025-09-26 00:27:57.299445
14	CREATE_LEAD	Created lead (Civic)	0	Lead	15	2025-09-26 01:41:08.656734
15	CREATE_LEAD	Created lead (Civic)	0	Lead	16	2025-09-26 14:10:56.626024
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
-- Data for Name: bank_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_details (id, "accountHolderName", "accountNumber", "bankName", "branchName", "ifscCode", iban, "swiftCode", "userId") FROM stdin;
1	John Doe	1234567890	Example Bank	Main Branch	EXMP0123456	EXMP1234567890	EXMPUS12345	5
\.


--
-- Data for Name: dealer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer (id, "userId", "tierId", name, owner, location, logo, website, "contactEmail", "tierName") FROM stdin;
1	4	1	John Motor	John Doe	London, UK	http://localhost:3001/uploads/logo.jpg	johnmotors.co.uk	contact@johnmotors.co.uk	1
3	6	1	John Doe	John Doe	John Doe	http://localhost:3001/uploads/logo.jpg	vJohn Doe	JohnDoe@gmail.com	1
5	8	1	Khan Motors	Khan Motors	Khan Motors		Khan Motors	khanmotors@gmail.com	1
6	9	1	sample dealer	sample dealer	sample dealer	http://localhost:3001/uploads/1758934729310-45f0950d-1615-40f8-8db9-6b594456b60a_removalai_preview.png.png	sample dealer	sample@dealer.com	1
2	5	1	Usmani Motor	Muneeb Usmani	London, UK	http://localhost:3001/uploads/logo.jpeg	muneebusmani.com	muneebusmani8355@gmail.com	1
\.


--
-- Data for Name: dealer_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dealer_leads (id, status, "userId", "leadId") FROM stdin;
3	OPEN	5	14
4	SENT	5	16
5	SENT	5	15
6	SENT	5	13
7	CONTACT	5	13
8	CONTACT	5	15
9	CONTACT	5	16
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
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, "invoiceId", "productName", "productDetails", "unitPrice", quantity, "totalPrice", "createdAt") FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, "invoiceNumber", date, "subTotal", "taxAmount", "totalAmount", "createdAt", "updatedAt", "grandTotal", "userId", "leadId") FROM stdin;
\.


--
-- Data for Name: lead_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_messages (id, content, "createdAt", "dealerId", "leadId", type) FROM stdin;
1	Hello	2025-09-25 14:26:58.364924	5	13	message
2	hi	2025-09-25 17:34:58.896956	5	13	message
3	Hi There Testing from muneeb	2025-09-25 19:47:53.889515	5	13	message
4	Hi	2025-09-25 19:55:57.74365	5	13	message
5	Hi	2025-09-25 20:02:16.067413	5	13	message
6	Hello	2025-09-25 20:05:42.211434	5	13	message
7	Loml	2025-09-25 20:09:04.851714	5	13	message
8	Loml2	2025-09-25 20:09:33.961922	5	13	message
9	Looml4	2025-09-25 20:10:51.665789	5	13	message
10	Hey there	2025-09-25 20:17:01.374125	5	13	message
11	How are you i am under the water ubuuububub	2025-09-25 20:18:43.761029	5	13	message
12	Mithu Mithu	2025-09-25 20:25:30.193261	5	13	message
13	Hi There	2025-09-25 21:02:25.881094	5	13	message
14	Helo THere	2025-09-26 00:23:22.845009	5	13	message
15	Hi There	2025-09-26 00:28:30.329576	5	14	message
16	hellow	2025-09-26 00:42:14.693595	5	13	message
17	testing	2025-09-26 00:42:41.595041	5	13	message
18	Hi there	2025-09-26 01:45:59.49271	5	15	message
19	Testing v3	2025-09-26 01:46:17.389816	5	14	message
20	Testing v4	2025-09-26 01:46:22.736877	5	15	message
21	Testing v5	2025-09-26 01:46:29.14229	5	13	message
22	testing lmao	2025-09-26 01:51:39.895746	5	14	message
23	testing loml	2025-09-26 01:51:46.944348	5	13	message
24	testing shaolin	2025-09-26 01:51:52.903375	5	15	message
25	Tesitng	2025-09-26 01:53:46.025671	5	13	message
26	testing	2025-09-26 01:53:53.574572	5	14	message
27	Testing	2025-09-26 01:53:58.628042	5	15	message
28	Yelllow	2025-09-26 02:17:02.249724	5	15	message
29	Hi	2025-09-26 14:11:28.091824	5	16	message
31	Hi there	2025-09-27 16:04:42.933397	5	13	message
32	Hello	2025-09-27 16:07:40.50152	5	13	message
30	{"id":"quotation-1758936529969","type":"quotation","sender":"user","timestamp":"2025-09-27T01:28:49.969Z","senderName":"You","status":"pending","subject":"Hi","message":"there","price":1}	2025-09-27 01:28:50.329561	5	13	quotation
33	a\nb\nc\nd	2025-09-27 16:10:41.301877	5	13	message
34	Hi there	2025-09-27 16:12:13.6719	5	13	message
35	Yo Sup	2025-09-27 22:29:33.993085	5	13	message
36	Yo	2025-09-27 22:29:48.282975	5	15	message
37	Yo	2025-09-27 22:29:57.767362	5	16	message
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leads (id, vehicle_model, vehicle_reg, vehicle_brand, vehicle_title, vehicle_vrm, vehicle_series, vehicle_part, engin_capacity, "fuelType", part_supplied, supply_only, consider_both, reconditioned_condition, used_condition, new_condition, consider_all_condition, postcode, vehicle_drive, collection_required, email, name, description, engine_code, source, status, assigned_to, follow_up_date, notes, "createdAt", "updatedAt", is_deleted) FROM stdin;
13	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	noobragaming36@gmail.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-25 13:24:02.935938	2025-09-25 13:24:02.935938	f
15	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	noobragaming36@gmail.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-26 01:41:08.638368	2025-09-26 01:41:08.638368	f
14	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	noobragaming36@gmail.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-26 00:27:57.286973	2025-09-26 01:53:38.259608	t
9	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	muneebusmani1122@gmail.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-22 19:52:35.840304	2025-09-26 01:56:17.331257	t
11	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	muneebusmani1122@gmail.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-24 13:42:43.344968	2025-09-26 01:56:17.6832	t
12	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	noobragaming36@gmail.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-24 13:42:46.103979	2025-09-26 02:49:13.99766	t
10	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	noobragaming36@gmail.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-24 01:14:43.635571	2025-09-26 02:49:14.597626	t
16	Civic	ABC-1234	Honda	Sedan	XYZ5678	2022	Engine	1800cc	Petrol	Yes	No	Yes	Yes	No	Yes	No	10001	FWD	Yes	alikhan.dec17@gmail.com	John Doe	Lead description goes here.	ENG123	\N	\N	\N	\N	\N	2025-09-26 14:10:56.603565	2025-09-26 14:10:56.603565	f
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, "engineCodeName", "dealershipName", "quotationPrice", subject, message, "dealerId", "leadId") FROM stdin;
1	ENG123	Ali Chandio Motors	5000.00	Quotation for engine	Here is the quotation for your request	5	16
2	ENG123	Ali Chandio Motors	5000.00	Quotation for engine	Here is the quotation for your request	5	16
3	ENG123	Ali Chandio Motors	5000.00	Quotation for engine	Here is the quotation for your request	5	16
4	ENG123	Ali Chandio Motors	100.00	Hi THere	This is a Quotation	5	16
5	ENG123	Ali Chandio Motors	10000.00	Yo Wassup	Yo Wassup	5	15
6	ENG123	Ali Chandio Motors	5000.00	Quotation for engine	Here is the quotation for your request	5	16
7	ENG123	Ali Chandio Motors	10000.00	Test Quotation	Test Quotation	5	15
8	ENG123	Ali Chandio Motors	100.00	Quotation Testing 6969	Quotation Testing 6969	5	13
9	ENG123	Ali Chandio Motors	1.00	Hi	there	5	13
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, password, name, username, type, status, "resetPasswordToken", "resetPasswordExpires") FROM stdin;
6	JohnDoe@gmail.com	$2b$10$y4okXoojTsIgaWYcOfU3du8wCppaWWzAUtlgdg/gar6l9Uz18rdRC	John Doe	John Doe	dealer	ACTIVE	\N	\N
4	john@enginefinderscrm.com	$2b$10$FrvBAvcwAONWgQeSGco5d.MuUslcKF6/yvK0ye1GOsoZmI/1utu3G	John Motor	johndoe	dealer	ACTIVE	\N	\N
8	khanmotors@gmail.com	$2b$10$S8YHsoIu/vPF9YcEZMJu7uQ4zIW0gWFEdMd1RSG8szbTKJr43i8qG	Khan Motors	KhanMotors	dealer	ACTIVE	\N	\N
9	sample@dealer.com	$2b$10$0P1gRFVaJN5Wbp3n5.urr.51WHFBK4Er9ETlnYYJq28Hnqvs8K6o2	sample dealer	sample dealer	dealer	ACTIVE	\N	\N
5	muneebusmani8355@gmail.com	$2b$10$OrYCTeR3CSYbsCQp.GubF.A.S1WEan2A9DmfztSLseb.G.CHOUSoO	Usmani Motor	muneeb	dealer	ACTIVE	\N	\N
\.


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 15, true);


--
-- Name: admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_id_seq', 1, false);


--
-- Name: admin_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_role_id_seq', 1, false);


--
-- Name: bank_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_details_id_seq', 1, true);


--
-- Name: dealer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dealer_id_seq', 7, true);


--
-- Name: dealer_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dealer_leads_id_seq', 9, true);


--
-- Name: dealer_tier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dealer_tier_id_seq', 4, true);


--
-- Name: lead_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lead_messages_id_seq', 37, true);


--
-- Name: leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leads_id_seq', 16, true);


--
-- Name: quotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quotations_id_seq', 9, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 10, true);


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
-- Name: invoice_items PK_53b99f9e0e2945e69de1a12b75a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY (id);


--
-- Name: invoices PK_668cef7c22a427fd822cc1be3ce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY (id);


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
-- Name: bank_details PK_ddbbcb9586b7f4d6124fe58f257; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_details
    ADD CONSTRAINT "PK_ddbbcb9586b7f4d6124fe58f257" PRIMARY KEY (id);


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
-- Name: invoices UQ_bf8e0f9dd4558ef209ec111782d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "UQ_bf8e0f9dd4558ef209ec111782d" UNIQUE ("invoiceNumber");


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
-- Name: invoice_items FK_7fb6895fc8fad9f5200e91abb59; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "FK_7fb6895fc8fad9f5200e91abb59" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices FK_82182ba474e5dcc53570ee4125b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_82182ba474e5dcc53570ee4125b" FOREIGN KEY ("leadId") REFERENCES public.leads(id);


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
-- Name: bank_details FK_d566e3c5f9b1b1c497d709c1fcc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_details
    ADD CONSTRAINT "FK_d566e3c5f9b1b1c497d709c1fcc" FOREIGN KEY ("userId") REFERENCES public."user"(id);


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
-- Name: invoices FK_fcbe490dc37a1abf68f19c5ccb9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_fcbe490dc37a1abf68f19c5ccb9" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- PostgreSQL database dump complete
--

