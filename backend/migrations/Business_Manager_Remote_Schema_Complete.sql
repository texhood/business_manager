--
-- PostgreSQL database dump
--

\restrict dAy5hCPC0fIrZdjutfnv9Dg7j8BzbkQUmJP4yrzA5xz0F4sSmKcUnZGjR3W3HhL

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 18.0

-- Started on 2026-02-08 09:52:31

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
-- TOC entry 2 (class 3079 OID 16389)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 5406 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1027 (class 1247 OID 16401)
-- Name: account_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_role AS ENUM (
    'admin',
    'staff',
    'customer',
    'super_admin',
    'accountant'
);


ALTER TYPE public.account_role OWNER TO postgres;

--
-- TOC entry 1108 (class 1247 OID 16848)
-- Name: account_subtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_subtype AS ENUM (
    'cash',
    'bank',
    'accounts_receivable',
    'inventory',
    'fixed_asset',
    'other_asset',
    'accounts_payable',
    'credit_card',
    'current_liability',
    'long_term_liability',
    'owners_equity',
    'retained_earnings',
    'sales',
    'other_income',
    'cost_of_goods',
    'operating_expense',
    'other_expense'
);


ALTER TYPE public.account_subtype OWNER TO postgres;

--
-- TOC entry 1105 (class 1247 OID 16836)
-- Name: account_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.account_type AS ENUM (
    'asset',
    'liability',
    'equity',
    'revenue',
    'expense'
);


ALTER TYPE public.account_type OWNER TO postgres;

--
-- TOC entry 1195 (class 1247 OID 17608)
-- Name: animal_species; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.animal_species AS ENUM (
    'Cattle',
    'Sheep',
    'Goat',
    'Poultry',
    'Guard Dog',
    'Other'
);


ALTER TYPE public.animal_species OWNER TO postgres;

--
-- TOC entry 1192 (class 1247 OID 17599)
-- Name: animal_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.animal_status AS ENUM (
    'Active',
    'Sold',
    'Dead',
    'Reference',
    'Processed'
);


ALTER TYPE public.animal_status OWNER TO postgres;

--
-- TOC entry 1402 (class 1247 OID 20258)
-- Name: asset_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.asset_status AS ENUM (
    'active',
    'fully_depreciated',
    'disposed',
    'inactive'
);


ALTER TYPE public.asset_status OWNER TO postgres;

--
-- TOC entry 1405 (class 1247 OID 20268)
-- Name: depreciation_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.depreciation_method AS ENUM (
    'straight_line',
    'declining_balance',
    'double_declining',
    'sum_of_years_digits',
    'units_of_production',
    'none'
);


ALTER TYPE public.depreciation_method OWNER TO postgres;

--
-- TOC entry 1408 (class 1247 OID 20282)
-- Name: disposal_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.disposal_method AS ENUM (
    'sold',
    'scrapped',
    'traded_in',
    'donated',
    'lost',
    'stolen',
    'written_off'
);


ALTER TYPE public.disposal_method OWNER TO postgres;

--
-- TOC entry 1261 (class 1247 OID 18383)
-- Name: herd_management_mode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.herd_management_mode AS ENUM (
    'individual',
    'aggregate'
);


ALTER TYPE public.herd_management_mode OWNER TO postgres;

--
-- TOC entry 1264 (class 1247 OID 18388)
-- Name: herd_species; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.herd_species AS ENUM (
    'cattle',
    'sheep',
    'goat',
    'poultry',
    'swine',
    'other'
);


ALTER TYPE public.herd_species OWNER TO postgres;

--
-- TOC entry 1153 (class 1247 OID 17111)
-- Name: item_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.item_status AS ENUM (
    'active',
    'inactive',
    'draft'
);


ALTER TYPE public.item_status OWNER TO postgres;

--
-- TOC entry 1030 (class 1247 OID 16408)
-- Name: item_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.item_type AS ENUM (
    'inventory',
    'non-inventory',
    'digital'
);


ALTER TYPE public.item_type OWNER TO postgres;

--
-- TOC entry 1111 (class 1247 OID 16884)
-- Name: journal_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.journal_status AS ENUM (
    'draft',
    'posted',
    'void'
);


ALTER TYPE public.journal_status OWNER TO postgres;

--
-- TOC entry 1039 (class 1247 OID 16432)
-- Name: membership_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.membership_status AS ENUM (
    'active',
    'expired',
    'cancelled'
);


ALTER TYPE public.membership_status OWNER TO postgres;

--
-- TOC entry 1042 (class 1247 OID 16440)
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'ready',
    'delivered',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- TOC entry 1267 (class 1247 OID 18402)
-- Name: processing_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.processing_status AS ENUM (
    'Pending',
    'At Processor',
    'Complete'
);


ALTER TYPE public.processing_status OWNER TO postgres;

--
-- TOC entry 1177 (class 1247 OID 17471)
-- Name: restaurant_order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.restaurant_order_status AS ENUM (
    'entered',
    'in_process',
    'done',
    'complete',
    'cancelled'
);


ALTER TYPE public.restaurant_order_status OWNER TO postgres;

--
-- TOC entry 1033 (class 1247 OID 16416)
-- Name: shipping_zone; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.shipping_zone AS ENUM (
    'not-shippable',
    'in-state',
    'in-country',
    'no-restrictions'
);


ALTER TYPE public.shipping_zone OWNER TO postgres;

--
-- TOC entry 1036 (class 1247 OID 16426)
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_type AS ENUM (
    'income',
    'expense'
);


ALTER TYPE public.transaction_type OWNER TO postgres;

--
-- TOC entry 1198 (class 1247 OID 17622)
-- Name: treatment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.treatment_type AS ENUM (
    'chemical',
    'mechanical'
);


ALTER TYPE public.treatment_type OWNER TO postgres;

--
-- TOC entry 406 (class 1255 OID 17083)
-- Name: generate_balance_sheet(date, integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_balance_sheet(p_as_of_date date, p_account_ids integer[] DEFAULT NULL::integer[]) RETURNS TABLE(account_id integer, account_code character varying, account_name character varying, account_type character varying, account_subtype character varying, balance numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.account_code,
        ac.name,
        ac.account_type,
        ac.account_subtype,
        CASE 
            WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
            ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
        END AS balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
        AND je.status = 'posted'
        AND je.entry_date <= p_as_of_date
    WHERE ac.account_type IN ('asset', 'liability', 'equity')
      AND (p_account_ids IS NULL OR ac.id = ANY(p_account_ids))
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_type, ac.account_subtype, ac.normal_balance
    HAVING CASE 
        WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
        ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
    END != 0
    ORDER BY 
        CASE ac.account_type 
            WHEN 'asset' THEN 1 
            WHEN 'liability' THEN 2 
            WHEN 'equity' THEN 3 
        END,
        ac.account_code;
END;
$$;


ALTER FUNCTION public.generate_balance_sheet(p_as_of_date date, p_account_ids integer[]) OWNER TO postgres;

--
-- TOC entry 405 (class 1255 OID 17082)
-- Name: generate_income_statement(date, date, integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_income_statement(p_start_date date, p_end_date date, p_account_ids integer[] DEFAULT NULL::integer[]) RETURNS TABLE(account_id integer, account_code character varying, account_name character varying, account_type character varying, account_subtype character varying, balance numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.account_code,
        ac.name,
        ac.account_type,
        ac.account_subtype,
        CASE 
            WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
            ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
        END AS balance
    FROM accounts_chart ac
    LEFT JOIN journal_entry_lines jel ON ac.id = jel.account_id
    LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id 
        AND je.status = 'posted'
        AND je.entry_date >= p_start_date 
        AND je.entry_date <= p_end_date
    WHERE ac.account_type IN ('revenue', 'expense')
      AND (p_account_ids IS NULL OR ac.id = ANY(p_account_ids))
    GROUP BY ac.id, ac.account_code, ac.name, ac.account_type, ac.account_subtype, ac.normal_balance
    HAVING CASE 
        WHEN ac.normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
        ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
    END != 0
    ORDER BY ac.account_type DESC, ac.account_code;
END;
$$;


ALTER FUNCTION public.generate_income_statement(p_start_date date, p_end_date date, p_account_ids integer[]) OWNER TO postgres;

--
-- TOC entry 390 (class 1255 OID 16995)
-- Name: generate_journal_entry_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_journal_entry_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.entry_number = 'JE-' || TO_CHAR(NEW.entry_date, 'YYMM') || '-' || LPAD(nextval('journal_entry_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_journal_entry_number() OWNER TO postgres;

--
-- TOC entry 385 (class 1255 OID 16812)
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.order_number = 'HFF-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_order_number() OWNER TO postgres;

--
-- TOC entry 408 (class 1255 OID 17085)
-- Name: generate_sales_by_class(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_sales_by_class(p_start_date date, p_end_date date) RETURNS TABLE(class_name character varying, account_code character varying, transaction_count bigint, total_amount numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.name AS class_name,
        ac.account_code,
        COUNT(DISTINCT je.id) AS transaction_count,
        SUM(jel.credit) AS total_amount
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.entry_date >= p_start_date
      AND je.entry_date <= p_end_date
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    GROUP BY ac.id, ac.name, ac.account_code
    ORDER BY SUM(jel.credit) DESC;
END;
$$;


ALTER FUNCTION public.generate_sales_by_class(p_start_date date, p_end_date date) OWNER TO postgres;

--
-- TOC entry 407 (class 1255 OID 17084)
-- Name: generate_sales_by_customer(date, date, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_sales_by_customer(p_start_date date, p_end_date date, p_limit integer DEFAULT 50) RETURNS TABLE(customer_name text, transaction_count bigint, total_amount numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(NULLIF(TRIM(
            SPLIT_PART(je.description, ' - ', 1)
        ), ''), 'Unknown') AS customer_name,
        COUNT(DISTINCT je.id) AS transaction_count,
        SUM(jel.credit) AS total_amount
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts_chart ac ON jel.account_id = ac.id
    WHERE je.status = 'posted'
      AND je.entry_date >= p_start_date
      AND je.entry_date <= p_end_date
      AND ac.account_type = 'revenue'
      AND jel.credit > 0
    GROUP BY SPLIT_PART(je.description, ' - ', 1)
    ORDER BY SUM(jel.credit) DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION public.generate_sales_by_customer(p_start_date date, p_end_date date, p_limit integer) OWNER TO postgres;

--
-- TOC entry 386 (class 1255 OID 16815)
-- Name: generate_trailer_order_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_trailer_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.order_number = 'FT-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('trailer_order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_trailer_order_number() OWNER TO postgres;

--
-- TOC entry 404 (class 1255 OID 17081)
-- Name: get_account_balance(integer, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_account_balance(p_account_id integer, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_balance NUMERIC;
    v_normal_balance VARCHAR(10);
BEGIN
    -- Get the normal balance type for this account
    SELECT normal_balance INTO v_normal_balance
    FROM accounts_chart WHERE id = p_account_id;
    
    -- Calculate balance based on date range
    SELECT 
        CASE 
            WHEN v_normal_balance = 'debit' THEN COALESCE(SUM(jel.debit), 0) - COALESCE(SUM(jel.credit), 0)
            ELSE COALESCE(SUM(jel.credit), 0) - COALESCE(SUM(jel.debit), 0)
        END
    INTO v_balance
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE jel.account_id = p_account_id
      AND je.status = 'posted'
      AND (p_start_date IS NULL OR je.entry_date >= p_start_date)
      AND (p_end_date IS NULL OR je.entry_date <= p_end_date);
    
    RETURN COALESCE(v_balance, 0);
END;
$$;


ALTER FUNCTION public.get_account_balance(p_account_id integer, p_start_date date, p_end_date date) OWNER TO postgres;

--
-- TOC entry 392 (class 1255 OID 16999)
-- Name: update_account_balances(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_account_balances() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- When posting an entry
    IF NEW.status = 'posted' AND OLD.status = 'draft' THEN
        UPDATE accounts_chart ac
        SET current_balance = current_balance + 
            CASE 
                WHEN ac.normal_balance = 'debit' THEN jel.debit - jel.credit
                ELSE jel.credit - jel.debit
            END,
            updated_at = CURRENT_TIMESTAMP
        FROM journal_entry_lines jel
        WHERE jel.journal_entry_id = NEW.id AND jel.account_id = ac.id;
    END IF;
    
    -- When voiding an entry
    IF NEW.status = 'void' AND OLD.status = 'posted' THEN
        UPDATE accounts_chart ac
        SET current_balance = current_balance - 
            CASE 
                WHEN ac.normal_balance = 'debit' THEN jel.debit - jel.credit
                ELSE jel.credit - jel.debit
            END,
            updated_at = CURRENT_TIMESTAMP
        FROM journal_entry_lines jel
        WHERE jel.journal_entry_id = NEW.id AND jel.account_id = ac.id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_account_balances() OWNER TO postgres;

--
-- TOC entry 388 (class 1255 OID 20420)
-- Name: update_fixed_asset_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_fixed_asset_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_fixed_asset_timestamp() OWNER TO postgres;

--
-- TOC entry 389 (class 1255 OID 16818)
-- Name: update_inventory_on_order(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_inventory_on_order() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Only update for inventory items
    IF EXISTS (SELECT 1 FROM items WHERE id = NEW.item_id AND item_type = 'inventory') THEN
        UPDATE items 
        SET inventory_quantity = inventory_quantity - NEW.quantity
        WHERE id = NEW.item_id;
        
        -- Log the inventory change
        INSERT INTO inventory_logs (item_id, quantity_change, quantity_before, quantity_after, reason, reference_type, reference_id)
        SELECT 
            NEW.item_id,
            -NEW.quantity,
            inventory_quantity + NEW.quantity,
            inventory_quantity,
            'sale',
            'order',
            NEW.order_id
        FROM items WHERE id = NEW.item_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_inventory_on_order() OWNER TO postgres;

--
-- TOC entry 391 (class 1255 OID 16997)
-- Name: update_journal_totals(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_journal_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE journal_entries
    SET 
        total_debit = (SELECT COALESCE(SUM(debit), 0) FROM journal_entry_lines WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id)),
        total_credit = (SELECT COALESCE(SUM(credit), 0) FROM journal_entry_lines WHERE journal_entry_id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id)),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.journal_entry_id, OLD.journal_entry_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.update_journal_totals() OWNER TO postgres;

--
-- TOC entry 409 (class 1255 OID 17596)
-- Name: update_modifications_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_modifications_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modifications_timestamp() OWNER TO postgres;

--
-- TOC entry 387 (class 1255 OID 19579)
-- Name: update_site_designer_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_site_designer_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_site_designer_timestamp() OWNER TO postgres;

--
-- TOC entry 384 (class 1255 OID 16803)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 321 (class 1259 OID 18419)
-- Name: _migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public._migrations OWNER TO postgres;

--
-- TOC entry 313 (class 1259 OID 18411)
-- Name: _migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public._migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5407 (class 0 OID 0)
-- Dependencies: 313
-- Name: _migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public._migrations_id_seq OWNED BY public._migrations.id;


--
-- TOC entry 219 (class 1259 OID 16462)
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    name character varying(255) NOT NULL,
    phone character varying(50),
    address text,
    city character varying(100),
    state character varying(50),
    zip_code character varying(20),
    role public.account_role DEFAULT 'customer'::public.account_role NOT NULL,
    delivery_zone_id character varying(50),
    is_farm_member boolean DEFAULT false NOT NULL,
    member_since date,
    member_discount_percent numeric(5,2) DEFAULT 10.00,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16892)
-- Name: accounts_chart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts_chart (
    id integer NOT NULL,
    account_code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    account_type public.account_type NOT NULL,
    account_subtype public.account_subtype,
    parent_id integer,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    is_system boolean DEFAULT false NOT NULL,
    normal_balance character varying(10) DEFAULT 'debit'::character varying NOT NULL,
    opening_balance numeric(14,2) DEFAULT 0,
    current_balance numeric(14,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.accounts_chart OWNER TO postgres;

--
-- TOC entry 5408 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN accounts_chart.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.accounts_chart.tenant_id IS 'Multi-tenant: Each tenant has their own chart of accounts';


--
-- TOC entry 243 (class 1259 OID 16891)
-- Name: accounts_chart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_chart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_chart_id_seq OWNER TO postgres;

--
-- TOC entry 5409 (class 0 OID 0)
-- Dependencies: 243
-- Name: accounts_chart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_chart_id_seq OWNED BY public.accounts_chart.id;


--
-- TOC entry 281 (class 1259 OID 17666)
-- Name: animal_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_categories (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_categories OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 17684)
-- Name: animal_owners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_owners (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(100) NOT NULL,
    contact_info text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_owners OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 17785)
-- Name: animal_sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_sales (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    animal_id integer,
    sale_date date NOT NULL,
    sale_price numeric(12,2),
    sold_to character varying(200),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_sales OWNER TO postgres;

--
-- TOC entry 5410 (class 0 OID 0)
-- Dependencies: 289
-- Name: TABLE animal_sales; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.animal_sales IS 'Sales records for sold animals';


--
-- TOC entry 277 (class 1259 OID 17628)
-- Name: animal_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_types (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(50) NOT NULL,
    species public.animal_species DEFAULT 'Cattle'::public.animal_species NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_types OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 17724)
-- Name: animals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animals (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    ear_tag character varying(50) NOT NULL,
    name character varying(100),
    animal_type_id integer,
    category_id integer,
    breed_id integer,
    color_markings character varying(100),
    dam_id integer,
    sire_id integer,
    owner_id integer,
    birth_date date,
    death_date date,
    purchase_date date,
    purchase_price numeric(12,2),
    current_pasture_id integer,
    status public.animal_status DEFAULT 'Active'::public.animal_status,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    herd_id integer
);


ALTER TABLE public.animals OWNER TO postgres;

--
-- TOC entry 5411 (class 0 OID 0)
-- Dependencies: 287
-- Name: TABLE animals; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.animals IS 'Livestock records - cattle, sheep, goats, etc.';


--
-- TOC entry 279 (class 1259 OID 17647)
-- Name: breeds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.breeds (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(100) NOT NULL,
    species public.animal_species DEFAULT 'Cattle'::public.animal_species NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.breeds OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 17998)
-- Name: herd_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.herd_summary AS
 SELECT a.id,
    a.tenant_id,
    a.ear_tag,
    a.name,
    at.name AS animal_type,
    ac.name AS category,
    b.name AS breed,
    a.color_markings,
    ao.name AS ownership,
    a.birth_date,
    a.death_date,
    a.purchase_date,
    a.purchase_price,
    s.sale_date,
    s.sale_price,
    s.sold_to,
    a.status,
    (EXTRACT(year FROM s.sale_date))::integer AS year_sold,
        CASE
            WHEN ((ac.name)::text = 'Harvested'::text) THEN (EXTRACT(year FROM a.death_date))::integer
            ELSE NULL::integer
        END AS year_harvested,
        CASE
            WHEN (((ac.name)::text = 'Breeders'::text) AND (a.status = 'Active'::public.animal_status)) THEN 'Current Asset'::text
            WHEN (((ac.name)::text = 'Breeders'::text) AND (a.status <> 'Active'::public.animal_status)) THEN 'Retired Asset'::text
            WHEN (((ac.name)::text <> 'Breeders'::text) AND (a.status = 'Active'::public.animal_status)) THEN 'Inventory'::text
            WHEN (((ac.name)::text <> 'Breeders'::text) AND (a.status <> 'Active'::public.animal_status)) THEN 'Disposed'::text
            ELSE NULL::text
        END AS asset_class,
        CASE
            WHEN ((b.name)::text = 'Katahdin'::text) THEN 'Sheep'::text
            WHEN ((ac.name)::text = 'Guard Dog'::text) THEN 'Guard Dog'::text
            ELSE 'Cattle'::text
        END AS species,
        CASE
            WHEN (a.birth_date IS NOT NULL) THEN (EXTRACT(year FROM age((COALESCE(a.death_date, CURRENT_DATE))::timestamp with time zone, (a.birth_date)::timestamp with time zone)) + (EXTRACT(month FROM age((COALESCE(a.death_date, CURRENT_DATE))::timestamp with time zone, (a.birth_date)::timestamp with time zone)) / 12.0))
            ELSE NULL::numeric
        END AS age_in_years,
    dam.ear_tag AS dam_ear_tag,
    dam.name AS dam_name,
    sire.ear_tag AS sire_ear_tag,
    sire.name AS sire_name
   FROM (((((((public.animals a
     LEFT JOIN public.animal_types at ON ((a.animal_type_id = at.id)))
     LEFT JOIN public.animal_categories ac ON ((a.category_id = ac.id)))
     LEFT JOIN public.breeds b ON ((a.breed_id = b.id)))
     LEFT JOIN public.animal_owners ao ON ((a.owner_id = ao.id)))
     LEFT JOIN public.animal_sales s ON ((a.id = s.animal_id)))
     LEFT JOIN public.animals dam ON ((a.dam_id = dam.id)))
     LEFT JOIN public.animals sire ON ((a.sire_id = sire.id)));


ALTER VIEW public.herd_summary OWNER TO postgres;

--
-- TOC entry 307 (class 1259 OID 18003)
-- Name: active_herd; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.active_herd AS
 SELECT id,
    tenant_id,
    ear_tag,
    name,
    animal_type,
    category,
    breed,
    color_markings,
    ownership,
    birth_date,
    death_date,
    purchase_date,
    purchase_price,
    sale_date,
    sale_price,
    sold_to,
    status,
    year_sold,
    year_harvested,
    asset_class,
    species,
    age_in_years,
    dam_ear_tag,
    dam_name,
    sire_ear_tag,
    sire_name
   FROM public.herd_summary
  WHERE (status = 'Active'::public.animal_status);


ALTER VIEW public.active_herd OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 17665)
-- Name: animal_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5412 (class 0 OID 0)
-- Dependencies: 280
-- Name: animal_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_categories_id_seq OWNED BY public.animal_categories.id;


--
-- TOC entry 293 (class 1259 OID 17833)
-- Name: animal_health_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_health_records (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    animal_id integer NOT NULL,
    record_date date NOT NULL,
    record_type character varying(50) NOT NULL,
    description text NOT NULL,
    administered_by character varying(100),
    next_due_date date,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_health_records OWNER TO postgres;

--
-- TOC entry 5413 (class 0 OID 0)
-- Dependencies: 293
-- Name: TABLE animal_health_records; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.animal_health_records IS 'Vaccination, treatment, and health records';


--
-- TOC entry 292 (class 1259 OID 17832)
-- Name: animal_health_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_health_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_health_records_id_seq OWNER TO postgres;

--
-- TOC entry 5414 (class 0 OID 0)
-- Dependencies: 292
-- Name: animal_health_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_health_records_id_seq OWNED BY public.animal_health_records.id;


--
-- TOC entry 282 (class 1259 OID 17683)
-- Name: animal_owners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_owners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_owners_id_seq OWNER TO postgres;

--
-- TOC entry 5415 (class 0 OID 0)
-- Dependencies: 282
-- Name: animal_owners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_owners_id_seq OWNED BY public.animal_owners.id;


--
-- TOC entry 288 (class 1259 OID 17784)
-- Name: animal_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_sales_id_seq OWNER TO postgres;

--
-- TOC entry 5416 (class 0 OID 0)
-- Dependencies: 288
-- Name: animal_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_sales_id_seq OWNED BY public.animal_sales.id;


--
-- TOC entry 276 (class 1259 OID 17627)
-- Name: animal_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_types_id_seq OWNER TO postgres;

--
-- TOC entry 5417 (class 0 OID 0)
-- Dependencies: 276
-- Name: animal_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_types_id_seq OWNED BY public.animal_types.id;


--
-- TOC entry 291 (class 1259 OID 17810)
-- Name: animal_weights; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.animal_weights (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    animal_id integer NOT NULL,
    weight_date date NOT NULL,
    weight_lbs numeric(8,2) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_weights OWNER TO postgres;

--
-- TOC entry 5418 (class 0 OID 0)
-- Dependencies: 291
-- Name: TABLE animal_weights; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.animal_weights IS 'Weight tracking for growth monitoring';


--
-- TOC entry 290 (class 1259 OID 17809)
-- Name: animal_weights_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animal_weights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_weights_id_seq OWNER TO postgres;

--
-- TOC entry 5419 (class 0 OID 0)
-- Dependencies: 290
-- Name: animal_weights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animal_weights_id_seq OWNED BY public.animal_weights.id;


--
-- TOC entry 286 (class 1259 OID 17723)
-- Name: animals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.animals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animals_id_seq OWNER TO postgres;

--
-- TOC entry 5420 (class 0 OID 0)
-- Dependencies: 286
-- Name: animals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.animals_id_seq OWNED BY public.animals.id;


--
-- TOC entry 365 (class 1259 OID 20210)
-- Name: app_registry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_registry (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50) DEFAULT 'layout-dashboard'::character varying,
    subdomain character varying(50) NOT NULL,
    url_pattern character varying(255) NOT NULL,
    min_plan_tier integer DEFAULT 1 NOT NULL,
    category character varying(50) DEFAULT 'core'::character varying,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    requires_roles text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.app_registry OWNER TO postgres;

--
-- TOC entry 368 (class 1259 OID 20370)
-- Name: asset_depreciation_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_depreciation_schedule (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    fixed_asset_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    period_number integer NOT NULL,
    period_date date NOT NULL,
    fiscal_period_id integer,
    depreciation_amount numeric(14,2) NOT NULL,
    accumulated_total numeric(14,2) NOT NULL,
    book_value_after numeric(14,2) NOT NULL,
    units_this_period numeric(14,2),
    journal_entry_id uuid,
    is_posted boolean DEFAULT false NOT NULL,
    posted_at timestamp with time zone,
    posted_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT asset_depr_amount_positive CHECK ((depreciation_amount >= (0)::numeric)),
    CONSTRAINT asset_depr_book_value_not_negative CHECK ((book_value_after >= (0)::numeric))
);


ALTER TABLE public.asset_depreciation_schedule OWNER TO postgres;

--
-- TOC entry 5421 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE asset_depreciation_schedule; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.asset_depreciation_schedule IS 'Monthly/periodic depreciation schedule for each fixed asset, with journal entry linkage';


--
-- TOC entry 5422 (class 0 OID 0)
-- Dependencies: 368
-- Name: COLUMN asset_depreciation_schedule.period_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_depreciation_schedule.period_number IS 'Sequential period number (1, 2, 3...) within the asset life';


--
-- TOC entry 5423 (class 0 OID 0)
-- Dependencies: 368
-- Name: COLUMN asset_depreciation_schedule.period_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_depreciation_schedule.period_date IS 'Last day of the period this depreciation applies to';


--
-- TOC entry 5424 (class 0 OID 0)
-- Dependencies: 368
-- Name: COLUMN asset_depreciation_schedule.depreciation_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_depreciation_schedule.depreciation_amount IS 'Depreciation expense for this single period';


--
-- TOC entry 5425 (class 0 OID 0)
-- Dependencies: 368
-- Name: COLUMN asset_depreciation_schedule.accumulated_total; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_depreciation_schedule.accumulated_total IS 'Running total of all depreciation through this period';


--
-- TOC entry 5426 (class 0 OID 0)
-- Dependencies: 368
-- Name: COLUMN asset_depreciation_schedule.book_value_after; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_depreciation_schedule.book_value_after IS 'Asset book value after this period depreciation (cost - accumulated)';


--
-- TOC entry 5427 (class 0 OID 0)
-- Dependencies: 368
-- Name: COLUMN asset_depreciation_schedule.units_this_period; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_depreciation_schedule.units_this_period IS 'Actual units consumed this period (units-of-production method only)';


--
-- TOC entry 5428 (class 0 OID 0)
-- Dependencies: 368
-- Name: COLUMN asset_depreciation_schedule.journal_entry_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.asset_depreciation_schedule.journal_entry_id IS 'Links to journal_entries when this period depreciation is posted to the books';


--
-- TOC entry 255 (class 1259 OID 17021)
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- TOC entry 5429 (class 0 OID 0)
-- Dependencies: 255
-- Name: TABLE classes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.classes IS 'Business segments/classes for tracking income and expenses by category';


--
-- TOC entry 5430 (class 0 OID 0)
-- Dependencies: 255
-- Name: COLUMN classes.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.classes.tenant_id IS 'Multi-tenant: Each tenant has their own business segments/classes';


--
-- TOC entry 367 (class 1259 OID 20297)
-- Name: fixed_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fixed_assets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    asset_number character varying(30) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    serial_number character varying(100),
    make character varying(100),
    model character varying(100),
    year integer,
    location character varying(255),
    barcode character varying(100),
    purchase_date date NOT NULL,
    in_service_date date,
    purchase_cost numeric(14,2) NOT NULL,
    vendor_id integer,
    depreciation_method public.depreciation_method DEFAULT 'straight_line'::public.depreciation_method NOT NULL,
    useful_life_months integer,
    salvage_value numeric(14,2) DEFAULT 0 NOT NULL,
    declining_balance_rate numeric(5,2),
    estimated_total_units numeric(14,2),
    units_label character varying(50),
    asset_account_id integer NOT NULL,
    accumulated_depreciation_account_id integer NOT NULL,
    depreciation_expense_account_id integer NOT NULL,
    class_id integer,
    accumulated_depreciation numeric(14,2) DEFAULT 0 NOT NULL,
    current_book_value numeric(14,2) NOT NULL,
    units_used numeric(14,2) DEFAULT 0,
    status public.asset_status DEFAULT 'active'::public.asset_status NOT NULL,
    disposal_date date,
    disposal_method public.disposal_method,
    disposal_amount numeric(14,2),
    disposal_notes text,
    disposal_journal_entry_id uuid,
    acquisition_journal_entry_id uuid,
    warranty_expiration date,
    insurance_policy character varying(100),
    photo_url character varying(500),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fixed_assets_declining_rate_range CHECK (((declining_balance_rate IS NULL) OR ((declining_balance_rate > (0)::numeric) AND (declining_balance_rate <= (100)::numeric)))),
    CONSTRAINT fixed_assets_disposal_requires_date CHECK (((status <> 'disposed'::public.asset_status) OR ((disposal_date IS NOT NULL) AND (disposal_method IS NOT NULL)))),
    CONSTRAINT fixed_assets_purchase_cost_positive CHECK ((purchase_cost >= (0)::numeric)),
    CONSTRAINT fixed_assets_salvage_lte_cost CHECK ((salvage_value <= purchase_cost)),
    CONSTRAINT fixed_assets_salvage_value_positive CHECK ((salvage_value >= (0)::numeric)),
    CONSTRAINT fixed_assets_useful_life_positive CHECK (((useful_life_months IS NULL) OR (useful_life_months > 0)))
);


ALTER TABLE public.fixed_assets OWNER TO postgres;

--
-- TOC entry 5431 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE fixed_assets; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.fixed_assets IS 'Fixed asset register tracking business property, equipment, vehicles, and infrastructure with depreciation';


--
-- TOC entry 5432 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.asset_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.asset_number IS 'Unique per-tenant identifier (e.g., FA-0001)';


--
-- TOC entry 5433 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.category IS 'Asset category: Vehicles, Equipment, Buildings, Land, Livestock Infrastructure, POS Hardware, Furniture, etc.';


--
-- TOC entry 5434 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.in_service_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.in_service_date IS 'Date asset was placed in service (may differ from purchase date)';


--
-- TOC entry 5435 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.declining_balance_rate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.declining_balance_rate IS 'Annual rate % for declining balance method (e.g., 40.00 for 40%)';


--
-- TOC entry 5436 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.estimated_total_units; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.estimated_total_units IS 'Total estimated units for units-of-production method (e.g., total miles, hours)';


--
-- TOC entry 5437 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.units_label; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.units_label IS 'Label for units-of-production tracking (e.g., miles, hours, units)';


--
-- TOC entry 5438 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.asset_account_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.asset_account_id IS 'GL fixed asset account (e.g., 1500 - Equipment)';


--
-- TOC entry 5439 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.accumulated_depreciation_account_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.accumulated_depreciation_account_id IS 'GL contra-asset account (e.g., 1510 - Accum Depr - Equipment)';


--
-- TOC entry 5440 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.depreciation_expense_account_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.depreciation_expense_account_id IS 'GL expense account (e.g., 6200 - Depreciation Expense)';


--
-- TOC entry 5441 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.current_book_value; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.current_book_value IS 'purchase_cost minus accumulated_depreciation (maintained on depreciation posting)';


--
-- TOC entry 5442 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.disposal_amount; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.disposal_amount IS 'Proceeds received from disposal (sale price, trade-in value, etc.)';


--
-- TOC entry 5443 (class 0 OID 0)
-- Dependencies: 367
-- Name: COLUMN fixed_assets.acquisition_journal_entry_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.fixed_assets.acquisition_journal_entry_id IS 'JE recording the initial asset purchase on the books';


--
-- TOC entry 310 (class 1259 OID 18021)
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(255) NOT NULL,
    display_name character varying(255),
    contact_name character varying(255),
    email character varying(255),
    phone character varying(50),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state character varying(50),
    postal_code character varying(20),
    country character varying(100) DEFAULT 'USA'::character varying,
    website character varying(255),
    tax_id character varying(50),
    payment_terms character varying(100),
    notes text,
    default_expense_account_id integer,
    default_class_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- TOC entry 5444 (class 0 OID 0)
-- Dependencies: 310
-- Name: TABLE vendors; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.vendors IS 'Vendors/suppliers for expense tracking';


--
-- TOC entry 5445 (class 0 OID 0)
-- Dependencies: 310
-- Name: COLUMN vendors.payment_terms; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendors.payment_terms IS 'e.g., Net 30, Due on Receipt, etc.';


--
-- TOC entry 5446 (class 0 OID 0)
-- Dependencies: 310
-- Name: COLUMN vendors.default_expense_account_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendors.default_expense_account_id IS 'Default GL account for expenses from this vendor';


--
-- TOC entry 5447 (class 0 OID 0)
-- Dependencies: 310
-- Name: COLUMN vendors.default_class_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendors.default_class_id IS 'Default business class for expenses from this vendor';


--
-- TOC entry 369 (class 1259 OID 20415)
-- Name: asset_register_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.asset_register_summary AS
 SELECT fa.id,
    fa.tenant_id,
    fa.asset_number,
    fa.name,
    fa.category,
    fa.status,
    fa.purchase_date,
    fa.in_service_date,
    fa.purchase_cost,
    fa.salvage_value,
    fa.depreciation_method,
    fa.useful_life_months,
    fa.accumulated_depreciation,
    fa.current_book_value,
    ac_asset.account_code AS asset_account_code,
    ac_asset.name AS asset_account_name,
    ac_accum.account_code AS accum_depr_account_code,
    ac_accum.name AS accum_depr_account_name,
    ac_exp.account_code AS depr_expense_account_code,
    ac_exp.name AS depr_expense_account_name,
    cl.name AS class_name,
    v.name AS vendor_name,
    fa.location,
    fa.serial_number,
    fa.disposal_date,
    fa.disposal_method,
    fa.disposal_amount
   FROM (((((public.fixed_assets fa
     JOIN public.accounts_chart ac_asset ON ((fa.asset_account_id = ac_asset.id)))
     JOIN public.accounts_chart ac_accum ON ((fa.accumulated_depreciation_account_id = ac_accum.id)))
     JOIN public.accounts_chart ac_exp ON ((fa.depreciation_expense_account_id = ac_exp.id)))
     LEFT JOIN public.classes cl ON ((fa.class_id = cl.id)))
     LEFT JOIN public.vendors v ON ((fa.vendor_id = v.id)))
  ORDER BY fa.tenant_id, fa.asset_number;


ALTER VIEW public.asset_register_summary OWNER TO postgres;

--
-- TOC entry 5448 (class 0 OID 0)
-- Dependencies: 369
-- Name: VIEW asset_register_summary; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.asset_register_summary IS 'Flattened view of fixed assets with account names, class, and vendor for reporting';


--
-- TOC entry 237 (class 1259 OID 16786)
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- TOC entry 5449 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN audit_log.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.audit_log.tenant_id IS 'Multi-tenant: Audit trail scoped to tenant';


--
-- TOC entry 251 (class 1259 OID 17007)
-- Name: balance_sheet; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.balance_sheet AS
 SELECT account_type,
    account_code,
    name,
    current_balance AS balance
   FROM public.accounts_chart ac
  WHERE ((is_active = true) AND (account_type = ANY (ARRAY['asset'::public.account_type, 'liability'::public.account_type, 'equity'::public.account_type])))
  ORDER BY account_type, account_code;


ALTER VIEW public.balance_sheet OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16600)
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_accounts (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    account_type character varying(50),
    last_four character varying(4),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.bank_accounts OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16599)
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_accounts_id_seq OWNER TO postgres;

--
-- TOC entry 5450 (class 0 OID 0)
-- Dependencies: 227
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- TOC entry 361 (class 1259 OID 19947)
-- Name: block_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.block_types (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    category character varying(50) DEFAULT 'content'::character varying,
    icon character varying(50),
    content_schema jsonb DEFAULT '{}'::jsonb,
    default_content jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.block_types OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 17121)
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug character varying(255) NOT NULL,
    title character varying(500) NOT NULL,
    excerpt text,
    content text NOT NULL,
    featured_image text,
    author_id uuid,
    author_name character varying(255),
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    published_at timestamp with time zone,
    tags text[],
    meta_title character varying(255),
    meta_description text,
    view_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    CONSTRAINT blog_posts_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- TOC entry 5451 (class 0 OID 0)
-- Dependencies: 263
-- Name: TABLE blog_posts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.blog_posts IS 'Blog posts for the Hood Family Farms website';


--
-- TOC entry 5452 (class 0 OID 0)
-- Dependencies: 263
-- Name: COLUMN blog_posts.slug; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.blog_posts.slug IS 'URL-friendly identifier for the post';


--
-- TOC entry 5453 (class 0 OID 0)
-- Dependencies: 263
-- Name: COLUMN blog_posts.content; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.blog_posts.content IS 'Full blog post content, can contain HTML or Markdown';


--
-- TOC entry 5454 (class 0 OID 0)
-- Dependencies: 263
-- Name: COLUMN blog_posts.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.blog_posts.status IS 'draft = not visible, published = visible on site, archived = hidden but preserved';


--
-- TOC entry 278 (class 1259 OID 17646)
-- Name: breeds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.breeds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.breeds_id_seq OWNER TO postgres;

--
-- TOC entry 5455 (class 0 OID 0)
-- Dependencies: 278
-- Name: breeds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.breeds_id_seq OWNED BY public.breeds.id;


--
-- TOC entry 324 (class 1259 OID 18458)
-- Name: buyers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buyers (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(200) NOT NULL,
    contact_name character varying(100),
    phone character varying(50),
    email character varying(255),
    address text,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.buyers OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 18412)
-- Name: buyers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.buyers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buyers_id_seq OWNER TO postgres;

--
-- TOC entry 5456 (class 0 OID 0)
-- Dependencies: 314
-- Name: buyers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.buyers_id_seq OWNED BY public.buyers.id;


--
-- TOC entry 221 (class 1259 OID 16489)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    type character varying(20) DEFAULT 'expense'::character varying
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16488)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- TOC entry 5457 (class 0 OID 0)
-- Dependencies: 220
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 254 (class 1259 OID 17020)
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classes_id_seq OWNER TO postgres;

--
-- TOC entry 5458 (class 0 OID 0)
-- Dependencies: 254
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- TOC entry 352 (class 1259 OID 19703)
-- Name: custom_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    record_type character varying(100) NOT NULL,
    selected_columns jsonb DEFAULT '[]'::jsonb NOT NULL,
    constraints jsonb DEFAULT '[]'::jsonb NOT NULL,
    sort_config jsonb DEFAULT '[]'::jsonb,
    group_by_fields jsonb DEFAULT '[]'::jsonb,
    aggregations jsonb DEFAULT '[]'::jsonb,
    page_size integer DEFAULT 50,
    show_row_numbers boolean DEFAULT false,
    show_totals boolean DEFAULT false,
    is_favorite boolean DEFAULT false,
    is_shared boolean DEFAULT false,
    run_count integer DEFAULT 0,
    last_run_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT custom_reports_page_size_check CHECK (((page_size > 0) AND (page_size <= 500)))
);


ALTER TABLE public.custom_reports OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16453)
-- Name: delivery_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_zones (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    schedule character varying(100) NOT NULL,
    radius integer DEFAULT 20 NOT NULL,
    base_city character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.delivery_zones OWNER TO postgres;

--
-- TOC entry 5459 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN delivery_zones.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.delivery_zones.tenant_id IS 'Multi-tenant: Delivery zones scoped to tenant';


--
-- TOC entry 230 (class 1259 OID 16637)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(50) NOT NULL,
    account_id uuid,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_email character varying(255) NOT NULL,
    customer_phone character varying(50),
    shipping_address text,
    shipping_city character varying(100),
    shipping_state character varying(50),
    shipping_zip character varying(20),
    delivery_zone_id character varying(50),
    delivery_date date,
    delivery_notes text,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    shipping_amount numeric(12,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    is_member_order boolean DEFAULT false NOT NULL,
    member_discount_percent numeric(5,2) DEFAULT 0,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    stripe_payment_intent_id character varying(255),
    ordered_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    confirmed_at timestamp with time zone,
    ready_at timestamp with time zone,
    delivered_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16829)
-- Name: customer_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.customer_summary AS
 SELECT a.id,
    a.name,
    a.email,
    a.is_farm_member,
    a.member_since,
    dz.name AS delivery_zone,
    count(DISTINCT o.id) AS total_orders,
    COALESCE(sum(o.total), (0)::numeric) AS lifetime_value,
    max(o.ordered_at) AS last_order_date
   FROM ((public.accounts a
     LEFT JOIN public.delivery_zones dz ON (((a.delivery_zone_id)::text = (dz.id)::text)))
     LEFT JOIN public.orders o ON ((a.id = o.account_id)))
  WHERE (a.role = 'customer'::public.account_role)
  GROUP BY a.id, a.name, a.email, a.is_farm_member, a.member_since, dz.name;


ALTER VIEW public.customer_summary OWNER TO postgres;

--
-- TOC entry 325 (class 1259 OID 18472)
-- Name: event_series; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_series (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(255) NOT NULL,
    description text,
    recurrence_type character varying(20),
    day_of_week integer,
    week_of_month integer,
    default_start_time time without time zone,
    default_end_time time without time zone,
    default_location_name character varying(255),
    default_address text,
    default_city character varying(100),
    default_state character varying(50),
    default_zip_code character varying(20),
    default_map_url text,
    default_menu_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT event_series_recurrence_type_check CHECK (((recurrence_type)::text = ANY (ARRAY[('weekly'::character varying)::text, ('biweekly'::character varying)::text, ('monthly'::character varying)::text])))
);


ALTER TABLE public.event_series OWNER TO postgres;

--
-- TOC entry 326 (class 1259 OID 18485)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    title character varying(500) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    event_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    timezone character varying(50) DEFAULT 'America/Chicago'::character varying,
    location_name character varying(255),
    address text,
    city character varying(100),
    state character varying(50),
    zip_code character varying(20),
    map_url text,
    latitude numeric(10,7),
    longitude numeric(10,7),
    menu_id uuid,
    featured_image text,
    is_featured boolean DEFAULT false,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    ticket_url text,
    facebook_event_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    series_id uuid,
    CONSTRAINT events_status_check CHECK (((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('scheduled'::character varying)::text, ('cancelled'::character varying)::text, ('completed'::character varying)::text])))
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16918)
-- Name: fiscal_periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fiscal_periods (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_closed boolean DEFAULT false NOT NULL,
    closed_at timestamp with time zone,
    closed_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.fiscal_periods OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16917)
-- Name: fiscal_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fiscal_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fiscal_periods_id_seq OWNER TO postgres;

--
-- TOC entry 5460 (class 0 OID 0)
-- Dependencies: 245
-- Name: fiscal_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fiscal_periods_id_seq OWNED BY public.fiscal_periods.id;


--
-- TOC entry 247 (class 1259 OID 16931)
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entry_number character varying(50) NOT NULL,
    entry_date date NOT NULL,
    fiscal_period_id integer,
    reference character varying(100),
    description text NOT NULL,
    status public.journal_status DEFAULT 'draft'::public.journal_status NOT NULL,
    source_type character varying(50),
    source_id uuid,
    total_debit numeric(14,2) DEFAULT 0 NOT NULL,
    total_credit numeric(14,2) DEFAULT 0 NOT NULL,
    is_balanced boolean GENERATED ALWAYS AS ((total_debit = total_credit)) STORED,
    notes text,
    posted_at timestamp with time zone,
    posted_by uuid,
    voided_at timestamp with time zone,
    voided_by uuid,
    void_reason text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    source character varying(50)
);


ALTER TABLE public.journal_entries OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16970)
-- Name: journal_entry_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_entry_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    journal_entry_id uuid NOT NULL,
    line_number integer NOT NULL,
    account_id integer NOT NULL,
    description text,
    debit numeric(14,2) DEFAULT 0 NOT NULL,
    credit numeric(14,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    class_id integer,
    tenant_id uuid NOT NULL,
    CONSTRAINT check_debit_or_credit CHECK ((((debit > (0)::numeric) AND (credit = (0)::numeric)) OR ((debit = (0)::numeric) AND (credit > (0)::numeric)) OR ((debit = (0)::numeric) AND (credit = (0)::numeric))))
);


ALTER TABLE public.journal_entry_lines OWNER TO postgres;

--
-- TOC entry 5461 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN journal_entry_lines.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.journal_entry_lines.tenant_id IS 'Defense-in-depth: Denormalized from journal_entries for direct-query tenant filtering';


--
-- TOC entry 253 (class 1259 OID 17015)
-- Name: general_ledger; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.general_ledger AS
 SELECT je.entry_date,
    je.entry_number,
    je.description AS entry_description,
    ac.account_code,
    ac.name AS account_name,
    jel.description AS line_description,
    jel.debit,
    jel.credit,
    je.status
   FROM ((public.journal_entries je
     JOIN public.journal_entry_lines jel ON ((je.id = jel.journal_entry_id)))
     JOIN public.accounts_chart ac ON ((jel.account_id = ac.id)))
  ORDER BY je.entry_date, je.entry_number, jel.line_number;


ALTER VIEW public.general_ledger OWNER TO postgres;

--
-- TOC entry 364 (class 1259 OID 20169)
-- Name: global_block_instances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.global_block_instances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    global_block_id uuid NOT NULL,
    page_id uuid NOT NULL,
    zone_key character varying(50) DEFAULT 'content'::character varying NOT NULL,
    display_order integer DEFAULT 0,
    setting_overrides jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.global_block_instances OWNER TO postgres;

--
-- TOC entry 363 (class 1259 OID 20148)
-- Name: global_blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.global_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    block_type character varying(50) NOT NULL,
    content jsonb DEFAULT '{}'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.global_blocks OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 17880)
-- Name: grazing_event_animals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grazing_event_animals (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    grazing_event_id integer NOT NULL,
    animal_id integer NOT NULL
);


ALTER TABLE public.grazing_event_animals OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 17879)
-- Name: grazing_event_animals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grazing_event_animals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grazing_event_animals_id_seq OWNER TO postgres;

--
-- TOC entry 5462 (class 0 OID 0)
-- Dependencies: 296
-- Name: grazing_event_animals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grazing_event_animals_id_seq OWNED BY public.grazing_event_animals.id;


--
-- TOC entry 371 (class 1259 OID 20615)
-- Name: herd_event_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.herd_event_types (
    id integer NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    default_unit character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.herd_event_types OWNER TO postgres;

--
-- TOC entry 370 (class 1259 OID 20614)
-- Name: herd_event_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.herd_event_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.herd_event_types_id_seq OWNER TO postgres;

--
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 370
-- Name: herd_event_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.herd_event_types_id_seq OWNED BY public.herd_event_types.id;


--
-- TOC entry 373 (class 1259 OID 20634)
-- Name: herd_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.herd_events (
    id integer NOT NULL,
    tenant_id uuid NOT NULL,
    herd_id integer NOT NULL,
    event_type_id integer NOT NULL,
    event_date date NOT NULL,
    quantity numeric(12,2),
    unit character varying(50),
    notes text,
    recorded_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.herd_events OWNER TO postgres;

--
-- TOC entry 372 (class 1259 OID 20633)
-- Name: herd_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.herd_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.herd_events_id_seq OWNER TO postgres;

--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 372
-- Name: herd_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.herd_events_id_seq OWNED BY public.herd_events.id;


--
-- TOC entry 312 (class 1259 OID 18115)
-- Name: herds_flocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.herds_flocks (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(255) NOT NULL,
    species character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    current_pasture_id integer,
    management_mode public.herd_management_mode DEFAULT 'individual'::public.herd_management_mode NOT NULL,
    notes text,
    animal_count integer DEFAULT 0
);


ALTER TABLE public.herds_flocks OWNER TO postgres;

--
-- TOC entry 311 (class 1259 OID 18114)
-- Name: herds_flocks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.herds_flocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.herds_flocks_id_seq OWNER TO postgres;

--
-- TOC entry 5465 (class 0 OID 0)
-- Dependencies: 311
-- Name: herds_flocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.herds_flocks_id_seq OWNED BY public.herds_flocks.id;


--
-- TOC entry 252 (class 1259 OID 17011)
-- Name: income_statement; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.income_statement AS
 SELECT account_type,
    account_subtype,
    account_code,
    name,
    current_balance AS balance
   FROM public.accounts_chart ac
  WHERE ((is_active = true) AND (account_type = ANY (ARRAY['revenue'::public.account_type, 'expense'::public.account_type])))
  ORDER BY account_type, account_code;


ALTER VIEW public.income_statement OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16698)
-- Name: inventory_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    item_id uuid NOT NULL,
    quantity_change integer NOT NULL,
    quantity_before integer NOT NULL,
    quantity_after integer NOT NULL,
    reason character varying(100) NOT NULL,
    reference_type character varying(50),
    reference_id uuid,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.inventory_logs OWNER TO postgres;

--
-- TOC entry 5466 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN inventory_logs.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.inventory_logs.tenant_id IS 'Multi-tenant: Inventory history scoped to tenant';


--
-- TOC entry 225 (class 1259 OID 16547)
-- Name: item_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_tags (
    item_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.item_tags OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16517)
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sku character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    item_type public.item_type DEFAULT 'inventory'::public.item_type NOT NULL,
    category_id integer,
    price numeric(10,2) NOT NULL,
    member_price numeric(10,2),
    cost numeric(10,2),
    inventory_quantity integer DEFAULT 0,
    low_stock_threshold integer DEFAULT 5,
    is_taxable boolean DEFAULT true NOT NULL,
    tax_rate numeric(5,4) DEFAULT 0.0825,
    shipping_zone public.shipping_zone DEFAULT 'in-state'::public.shipping_zone NOT NULL,
    weight_oz numeric(8,2),
    is_active boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0,
    image_url text,
    digital_file_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status public.item_status DEFAULT 'draft'::public.item_status NOT NULL,
    stripe_product_id character varying(255),
    stripe_price_id character varying(255),
    stripe_member_price_id character varying(255),
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.items OWNER TO postgres;

--
-- TOC entry 5467 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN items.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.items.status IS 'active=can be sold/purchased and visible, inactive=hidden and disabled, draft=work in progress';


--
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN items.stripe_product_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.items.stripe_product_id IS 'Stripe Product ID for this item';


--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN items.stripe_price_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.items.stripe_price_id IS 'Stripe Price ID for regular price';


--
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN items.stripe_member_price_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.items.stripe_member_price_id IS 'Stripe Price ID for member price';


--
-- TOC entry 240 (class 1259 OID 16820)
-- Name: items_with_details; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.items_with_details AS
SELECT
    NULL::uuid AS id,
    NULL::character varying(50) AS sku,
    NULL::character varying(255) AS name,
    NULL::text AS description,
    NULL::public.item_type AS item_type,
    NULL::integer AS category_id,
    NULL::numeric(10,2) AS price,
    NULL::numeric(10,2) AS member_price,
    NULL::numeric(10,2) AS cost,
    NULL::integer AS inventory_quantity,
    NULL::integer AS low_stock_threshold,
    NULL::boolean AS is_taxable,
    NULL::numeric(5,4) AS tax_rate,
    NULL::public.shipping_zone AS shipping_zone,
    NULL::numeric(8,2) AS weight_oz,
    NULL::boolean AS is_active,
    NULL::boolean AS is_featured,
    NULL::integer AS sort_order,
    NULL::text AS image_url,
    NULL::text AS digital_file_url,
    NULL::timestamp with time zone AS created_at,
    NULL::timestamp with time zone AS updated_at,
    NULL::character varying(100) AS category_name,
    NULL::character varying(100) AS category_slug,
    NULL::text AS stock_status,
    NULL::numeric AS calculated_member_price,
    NULL::character varying[] AS tag_names;


ALTER VIEW public.items_with_details OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16994)
-- Name: journal_entry_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_entry_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_entry_seq OWNER TO postgres;

--
-- TOC entry 328 (class 1259 OID 18514)
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    filename character varying(255) NOT NULL,
    original_filename character varying(255) NOT NULL,
    mime_type character varying(100) NOT NULL,
    file_size integer NOT NULL,
    storage_provider character varying(50) DEFAULT 'local'::character varying,
    storage_key character varying(500) NOT NULL,
    storage_url text NOT NULL,
    width integer,
    height integer,
    thumbnails jsonb DEFAULT '{}'::jsonb,
    folder character varying(255) DEFAULT 'uploads'::character varying,
    alt_text text,
    caption text,
    title character varying(255),
    tags text[],
    usage_count integer DEFAULT 0,
    version integer DEFAULT 1,
    parent_id uuid,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media OWNER TO postgres;

--
-- TOC entry 327 (class 1259 OID 18502)
-- Name: media_folders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_folders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media_folders OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16562)
-- Name: memberships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.memberships (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    account_id uuid NOT NULL,
    item_id uuid,
    status public.membership_status DEFAULT 'active'::public.membership_status NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    auto_renew boolean DEFAULT true NOT NULL,
    payment_method character varying(50),
    stripe_subscription_id character varying(255),
    discount_percent numeric(5,2) DEFAULT 10.00,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.memberships OWNER TO postgres;

--
-- TOC entry 5471 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN memberships.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.memberships.tenant_id IS 'Multi-tenant: Customer memberships scoped to tenant';


--
-- TOC entry 234 (class 1259 OID 16731)
-- Name: menu_item_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_item_ingredients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    menu_item_id uuid NOT NULL,
    item_id uuid,
    ingredient_name character varying(255) NOT NULL,
    quantity_used numeric(10,4) NOT NULL,
    unit character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_item_ingredients OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 17567)
-- Name: menu_item_modifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_item_modifications (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    modification_id integer NOT NULL,
    price_override numeric(10,2),
    is_default boolean DEFAULT false,
    group_name character varying(50),
    is_required boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_item_modifications OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 17566)
-- Name: menu_item_modifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.menu_item_modifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_item_modifications_id_seq OWNER TO postgres;

--
-- TOC entry 5472 (class 0 OID 0)
-- Dependencies: 274
-- Name: menu_item_modifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.menu_item_modifications_id_seq OWNED BY public.menu_item_modifications.id;


--
-- TOC entry 233 (class 1259 OID 16719)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    category character varying(100),
    is_available boolean DEFAULT true NOT NULL,
    prep_time_minutes integer,
    image_url text,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    is_spicy boolean DEFAULT false,
    stripe_product_id character varying(255),
    is_vegan boolean DEFAULT false,
    item_id uuid,
    price_label character varying(100),
    is_vegetarian boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    is_dairy_free boolean DEFAULT false,
    is_gluten_free boolean DEFAULT false,
    allergens text[],
    stripe_price_id character varying(255)
);


ALTER TABLE public.menu_items OWNER TO postgres;

--
-- TOC entry 5473 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE menu_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.menu_items IS 'Individual menu items - can be reused across menus';


--
-- TOC entry 267 (class 1259 OID 17386)
-- Name: menu_section_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_section_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    section_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    override_price numeric(10,2),
    override_description text,
    sort_order integer DEFAULT 0,
    is_available boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_section_items OWNER TO postgres;

--
-- TOC entry 5474 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE menu_section_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.menu_section_items IS 'Links items to sections with ordering and optional overrides';


--
-- TOC entry 266 (class 1259 OID 17368)
-- Name: menu_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_sections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    menu_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    sort_order integer DEFAULT 0,
    show_prices boolean DEFAULT true,
    columns integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.menu_sections OWNER TO postgres;

--
-- TOC entry 5475 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE menu_sections; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.menu_sections IS 'Sections within a menu (Appetizers, Mains, etc.)';


--
-- TOC entry 265 (class 1259 OID 17335)
-- Name: menus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menus (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    season character varying(50),
    menu_type character varying(50) DEFAULT 'food_trailer'::character varying,
    header_image text,
    footer_text text,
    status character varying(20) DEFAULT 'draft'::character varying,
    is_featured boolean DEFAULT false,
    version integer DEFAULT 1,
    parent_id uuid,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT menus_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.menus OWNER TO postgres;

--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE menus; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.menus IS 'Food trailer menus - reusable menu templates';


--
-- TOC entry 273 (class 1259 OID 17553)
-- Name: modifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modifications (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100),
    price_adjustment numeric(10,2) DEFAULT 0,
    category character varying(50) DEFAULT 'general'::character varying NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.modifications OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 17552)
-- Name: modifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modifications_id_seq OWNER TO postgres;

--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 272
-- Name: modifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modifications_id_seq OWNED BY public.modifications.id;


--
-- TOC entry 229 (class 1259 OID 16608)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    date date NOT NULL,
    type public.transaction_type NOT NULL,
    description text NOT NULL,
    amount numeric(12,2) NOT NULL,
    bank_account_id integer,
    reference character varying(100),
    order_id uuid,
    vendor character varying(255),
    is_reconciled boolean DEFAULT false NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    class_id integer,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    vendor_id integer,
    account_id uuid,
    plaid_transaction_id character varying(100),
    source character varying(50) DEFAULT 'manual'::character varying,
    exclusion_reason text,
    accepted_at timestamp with time zone,
    excluded_reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    accepted_by uuid,
    plaid_account_id integer,
    category character varying(100),
    accepted_gl_account_id integer,
    acceptance_status character varying(20) DEFAULT 'pending'::character varying
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 5478 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN transactions.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transactions.tenant_id IS 'Multi-tenant: Transactions belong to a specific tenant';


--
-- TOC entry 5479 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN transactions.vendor_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transactions.vendor_id IS 'Reference to vendors table (replaces vendor text field)';


--
-- TOC entry 241 (class 1259 OID 16825)
-- Name: monthly_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.monthly_summary AS
 SELECT date_trunc('month'::text, (date)::timestamp with time zone) AS month,
    sum(
        CASE
            WHEN (type = 'income'::public.transaction_type) THEN amount
            ELSE (0)::numeric
        END) AS total_income,
    sum(
        CASE
            WHEN (type = 'expense'::public.transaction_type) THEN amount
            ELSE (0)::numeric
        END) AS total_expenses,
    sum(
        CASE
            WHEN (type = 'income'::public.transaction_type) THEN amount
            ELSE (- amount)
        END) AS net_profit
   FROM public.transactions
  GROUP BY (date_trunc('month'::text, (date)::timestamp with time zone))
  ORDER BY (date_trunc('month'::text, (date)::timestamp with time zone)) DESC;


ALTER VIEW public.monthly_summary OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16673)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    item_id uuid,
    sku character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    member_price numeric(10,2),
    price_used numeric(10,2) NOT NULL,
    is_taxable boolean DEFAULT true NOT NULL,
    tax_rate numeric(5,4) DEFAULT 0,
    tax_amount numeric(10,2) DEFAULT 0,
    line_total numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16813)
-- Name: order_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_number_seq OWNER TO postgres;

--
-- TOC entry 362 (class 1259 OID 20120)
-- Name: page_blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    zone_key character varying(50) DEFAULT 'content'::character varying NOT NULL,
    block_type character varying(50) NOT NULL,
    content jsonb DEFAULT '{}'::jsonb,
    settings jsonb DEFAULT '{}'::jsonb,
    display_order integer DEFAULT 0,
    is_visible boolean DEFAULT true,
    parent_block_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.page_blocks OWNER TO postgres;

--
-- TOC entry 330 (class 1259 OID 18545)
-- Name: page_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid NOT NULL,
    section_type character varying(50) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_enabled boolean DEFAULT true,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.page_sections OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 17856)
-- Name: pasture_grazing_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasture_grazing_events (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    pasture_id integer NOT NULL,
    start_date date NOT NULL,
    end_date date,
    initial_grass_height numeric(6,2),
    final_grass_height numeric(6,2),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pasture_grazing_events OWNER TO postgres;

--
-- TOC entry 5480 (class 0 OID 0)
-- Dependencies: 295
-- Name: TABLE pasture_grazing_events; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pasture_grazing_events IS 'Rotational grazing tracking';


--
-- TOC entry 294 (class 1259 OID 17855)
-- Name: pasture_grazing_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pasture_grazing_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_grazing_events_id_seq OWNER TO postgres;

--
-- TOC entry 5481 (class 0 OID 0)
-- Dependencies: 294
-- Name: pasture_grazing_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pasture_grazing_events_id_seq OWNED BY public.pasture_grazing_events.id;


--
-- TOC entry 301 (class 1259 OID 17929)
-- Name: pasture_nutrients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasture_nutrients (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    soil_sample_id integer NOT NULL,
    nutrient character varying(50) NOT NULL,
    target_level numeric(10,4),
    actual_level numeric(10,4),
    unit character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pasture_nutrients OWNER TO postgres;

--
-- TOC entry 5482 (class 0 OID 0)
-- Dependencies: 301
-- Name: TABLE pasture_nutrients; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pasture_nutrients IS 'Nutrient levels from soil samples';


--
-- TOC entry 300 (class 1259 OID 17928)
-- Name: pasture_nutrients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pasture_nutrients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_nutrients_id_seq OWNER TO postgres;

--
-- TOC entry 5483 (class 0 OID 0)
-- Dependencies: 300
-- Name: pasture_nutrients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pasture_nutrients_id_seq OWNED BY public.pasture_nutrients.id;


--
-- TOC entry 299 (class 1259 OID 17905)
-- Name: pasture_soil_samples; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasture_soil_samples (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    pasture_id integer NOT NULL,
    sample_id character varying(100) NOT NULL,
    sample_date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pasture_soil_samples OWNER TO postgres;

--
-- TOC entry 5484 (class 0 OID 0)
-- Dependencies: 299
-- Name: TABLE pasture_soil_samples; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pasture_soil_samples IS 'Soil testing records';


--
-- TOC entry 298 (class 1259 OID 17904)
-- Name: pasture_soil_samples_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pasture_soil_samples_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_soil_samples_id_seq OWNER TO postgres;

--
-- TOC entry 5485 (class 0 OID 0)
-- Dependencies: 298
-- Name: pasture_soil_samples_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pasture_soil_samples_id_seq OWNED BY public.pasture_soil_samples.id;


--
-- TOC entry 303 (class 1259 OID 17949)
-- Name: pasture_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasture_tasks (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    pasture_id integer NOT NULL,
    task_description text NOT NULL,
    due_date date,
    completed_date date,
    is_completed boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pasture_tasks OWNER TO postgres;

--
-- TOC entry 5486 (class 0 OID 0)
-- Dependencies: 303
-- Name: TABLE pasture_tasks; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pasture_tasks IS 'Pasture maintenance tasks';


--
-- TOC entry 285 (class 1259 OID 17703)
-- Name: pastures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pastures (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(100) NOT NULL,
    size_acres numeric(10,2),
    location character varying(255),
    latitude numeric(10,6),
    longitude numeric(10,6),
    map_url text,
    productivity_rating numeric(5,2),
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pastures OWNER TO postgres;

--
-- TOC entry 5487 (class 0 OID 0)
-- Dependencies: 285
-- Name: TABLE pastures; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pastures IS 'Pasture/paddock management';


--
-- TOC entry 308 (class 1259 OID 18008)
-- Name: pasture_status; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.pasture_status AS
 SELECT p.id,
    p.tenant_id,
    p.name,
    p.size_acres,
    p.productivity_rating,
    cge.id AS current_grazing_event_id,
    cge.start_date AS grazing_start,
    cge.initial_grass_height,
    ( SELECT count(*) AS count
           FROM public.animals a
          WHERE ((a.current_pasture_id = p.id) AND (a.status = 'Active'::public.animal_status))) AS animal_count,
    ( SELECT pss.sample_date
           FROM public.pasture_soil_samples pss
          WHERE (pss.pasture_id = p.id)
          ORDER BY pss.sample_date DESC
         LIMIT 1) AS last_soil_sample,
    ( SELECT count(*) AS count
           FROM public.pasture_tasks pt
          WHERE ((pt.pasture_id = p.id) AND (pt.is_completed = false))) AS pending_tasks
   FROM (public.pastures p
     LEFT JOIN public.pasture_grazing_events cge ON (((p.id = cge.pasture_id) AND (cge.end_date IS NULL))));


ALTER VIEW public.pasture_status OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 17948)
-- Name: pasture_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pasture_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_tasks_id_seq OWNER TO postgres;

--
-- TOC entry 5488 (class 0 OID 0)
-- Dependencies: 302
-- Name: pasture_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pasture_tasks_id_seq OWNED BY public.pasture_tasks.id;


--
-- TOC entry 305 (class 1259 OID 17975)
-- Name: pasture_treatments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasture_treatments (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    pasture_id integer NOT NULL,
    treatment_date date NOT NULL,
    treatment_type public.treatment_type NOT NULL,
    treatment_description character varying(200),
    chemical_used character varying(200),
    application_rate numeric(10,4),
    application_rate_unit character varying(20),
    equipment_used character varying(200),
    fuel_used numeric(10,2),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pasture_treatments OWNER TO postgres;

--
-- TOC entry 5489 (class 0 OID 0)
-- Dependencies: 305
-- Name: TABLE pasture_treatments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pasture_treatments IS 'Chemical and mechanical pasture treatments';


--
-- TOC entry 304 (class 1259 OID 17974)
-- Name: pasture_treatments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pasture_treatments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_treatments_id_seq OWNER TO postgres;

--
-- TOC entry 5490 (class 0 OID 0)
-- Dependencies: 304
-- Name: pasture_treatments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pasture_treatments_id_seq OWNED BY public.pasture_treatments.id;


--
-- TOC entry 284 (class 1259 OID 17702)
-- Name: pastures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pastures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pastures_id_seq OWNER TO postgres;

--
-- TOC entry 5491 (class 0 OID 0)
-- Dependencies: 284
-- Name: pastures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pastures_id_seq OWNED BY public.pastures.id;


--
-- TOC entry 262 (class 1259 OID 17097)
-- Name: plaid_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plaid_accounts (
    id integer NOT NULL,
    plaid_item_id integer,
    account_id text NOT NULL,
    name text,
    type text,
    mask text,
    is_active boolean DEFAULT true,
    current_balance numeric(12,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    linked_account_id integer,
    official_name character varying(255),
    available_balance numeric(12,2),
    subtype character varying(50),
    iso_currency_code character varying(3) DEFAULT 'USD'::character varying,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.plaid_accounts OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 17096)
-- Name: plaid_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plaid_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plaid_accounts_id_seq OWNER TO postgres;

--
-- TOC entry 5492 (class 0 OID 0)
-- Dependencies: 261
-- Name: plaid_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plaid_accounts_id_seq OWNED BY public.plaid_accounts.id;


--
-- TOC entry 260 (class 1259 OID 17087)
-- Name: plaid_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plaid_items (
    id integer NOT NULL,
    access_token text NOT NULL,
    item_id text NOT NULL,
    institution_name text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    status text DEFAULT 'active'::text,
    institution_id text,
    error_message text,
    error_code text,
    cursor text,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.plaid_items OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 17086)
-- Name: plaid_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.plaid_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plaid_items_id_seq OWNER TO postgres;

--
-- TOC entry 5493 (class 0 OID 0)
-- Dependencies: 259
-- Name: plaid_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.plaid_items_id_seq OWNED BY public.plaid_items.id;


--
-- TOC entry 358 (class 1259 OID 19855)
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    key character varying(255) NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE platform_settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.platform_settings IS 'Global platform configuration settings';


--
-- TOC entry 343 (class 1259 OID 19091)
-- Name: pos_layout_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_layout_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    layout_id uuid NOT NULL,
    item_id uuid NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    grid_row integer,
    grid_column integer,
    display_name character varying(100),
    display_color character varying(7),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pos_layout_items OWNER TO postgres;

--
-- TOC entry 5495 (class 0 OID 0)
-- Dependencies: 343
-- Name: TABLE pos_layout_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pos_layout_items IS 'Items assigned to each POS layout with positioning';


--
-- TOC entry 5496 (class 0 OID 0)
-- Dependencies: 343
-- Name: COLUMN pos_layout_items.display_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pos_layout_items.display_order IS 'Sort order for items (lower = first)';


--
-- TOC entry 5497 (class 0 OID 0)
-- Dependencies: 343
-- Name: COLUMN pos_layout_items.display_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pos_layout_items.display_name IS 'Optional override for item name on POS';


--
-- TOC entry 5498 (class 0 OID 0)
-- Dependencies: 343
-- Name: COLUMN pos_layout_items.display_color; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pos_layout_items.display_color IS 'Optional button color (hex)';


--
-- TOC entry 342 (class 1259 OID 19061)
-- Name: pos_layouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_layouts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    grid_columns integer DEFAULT 4,
    created_by uuid,
    updated_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pos_layouts OWNER TO postgres;

--
-- TOC entry 5499 (class 0 OID 0)
-- Dependencies: 342
-- Name: TABLE pos_layouts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pos_layouts IS 'Named POS terminal layouts for customizing item display';


--
-- TOC entry 5500 (class 0 OID 0)
-- Dependencies: 342
-- Name: COLUMN pos_layouts.grid_columns; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pos_layouts.grid_columns IS 'Number of columns in the item grid';


--
-- TOC entry 269 (class 1259 OID 17444)
-- Name: pos_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    item_id uuid,
    name character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pos_order_items OWNER TO postgres;

--
-- TOC entry 5501 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE pos_order_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pos_order_items IS 'Line items within POS orders';


--
-- TOC entry 268 (class 1259 OID 17417)
-- Name: pos_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pos_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    order_number character varying(50) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    payment_method character varying(20) NOT NULL,
    payment_intent_id character varying(255),
    cash_received numeric(10,2),
    change_given numeric(10,2),
    status character varying(20) DEFAULT 'completed'::character varying,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pos_orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['card'::character varying, 'cash'::character varying, 'split'::character varying])::text[]))),
    CONSTRAINT pos_orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'refunded'::character varying, 'voided'::character varying])::text[])))
);


ALTER TABLE public.pos_orders OWNER TO postgres;

--
-- TOC entry 5502 (class 0 OID 0)
-- Dependencies: 268
-- Name: TABLE pos_orders; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.pos_orders IS 'Point-of-sale orders from the POS terminal';


--
-- TOC entry 5503 (class 0 OID 0)
-- Dependencies: 268
-- Name: COLUMN pos_orders.order_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pos_orders.order_number IS 'Human-readable order number (YYYYMMDD-NNN format)';


--
-- TOC entry 5504 (class 0 OID 0)
-- Dependencies: 268
-- Name: COLUMN pos_orders.payment_intent_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pos_orders.payment_intent_id IS 'Stripe PaymentIntent ID for card payments';


--
-- TOC entry 336 (class 1259 OID 18638)
-- Name: processing_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.processing_records (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    animal_id integer,
    herd_id integer,
    processing_date date NOT NULL,
    processor_name character varying(200),
    status public.processing_status DEFAULT 'Pending'::public.processing_status NOT NULL,
    notes text,
    completed_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    processor_contact text,
    hanging_weight_lbs numeric(10,2),
    packaged_weight_lbs numeric(10,2),
    cost numeric(10,2),
    CONSTRAINT chk_animal_or_herd CHECK ((((animal_id IS NOT NULL) AND (herd_id IS NULL)) OR ((animal_id IS NULL) AND (herd_id IS NOT NULL))))
);


ALTER TABLE public.processing_records OWNER TO postgres;

--
-- TOC entry 315 (class 1259 OID 18413)
-- Name: processing_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.processing_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.processing_records_id_seq OWNER TO postgres;

--
-- TOC entry 5505 (class 0 OID 0)
-- Dependencies: 315
-- Name: processing_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.processing_records_id_seq OWNED BY public.processing_records.id;


--
-- TOC entry 337 (class 1259 OID 18651)
-- Name: rainfall_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rainfall_records (
    id integer NOT NULL,
    tenant_id uuid NOT NULL,
    record_date date NOT NULL,
    amount_inches numeric(6,2) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rainfall_records OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 18414)
-- Name: rainfall_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rainfall_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rainfall_records_id_seq OWNER TO postgres;

--
-- TOC entry 5506 (class 0 OID 0)
-- Dependencies: 316
-- Name: rainfall_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rainfall_records_id_seq OWNED BY public.rainfall_records.id;


--
-- TOC entry 257 (class 1259 OID 17056)
-- Name: report_configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_configurations (
    id integer NOT NULL,
    report_type character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    account_ids integer[],
    settings jsonb DEFAULT '{}'::jsonb,
    is_default boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.report_configurations OWNER TO postgres;

--
-- TOC entry 5507 (class 0 OID 0)
-- Dependencies: 257
-- Name: COLUMN report_configurations.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.report_configurations.tenant_id IS 'Multi-tenant: Report configs scoped to tenant';


--
-- TOC entry 256 (class 1259 OID 17055)
-- Name: report_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_configurations_id_seq OWNER TO postgres;

--
-- TOC entry 5508 (class 0 OID 0)
-- Dependencies: 256
-- Name: report_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_configurations_id_seq OWNED BY public.report_configurations.id;


--
-- TOC entry 350 (class 1259 OID 19678)
-- Name: report_field_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_field_definitions (
    id integer NOT NULL,
    record_id integer NOT NULL,
    field_name character varying(100) NOT NULL,
    display_name character varying(255) NOT NULL,
    data_type character varying(50) NOT NULL,
    enum_values jsonb,
    is_filterable boolean DEFAULT true,
    is_sortable boolean DEFAULT true,
    is_groupable boolean DEFAULT false,
    is_aggregatable boolean DEFAULT false,
    default_selected boolean DEFAULT false,
    format_hint character varying(50),
    column_width integer,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_field_definitions_data_type_check CHECK (((data_type)::text = ANY (ARRAY[('text'::character varying)::text, ('number'::character varying)::text, ('date'::character varying)::text, ('datetime'::character varying)::text, ('boolean'::character varying)::text, ('enum'::character varying)::text, ('currency'::character varying)::text])))
);


ALTER TABLE public.report_field_definitions OWNER TO postgres;

--
-- TOC entry 351 (class 1259 OID 19701)
-- Name: report_field_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_field_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_field_definitions_id_seq OWNER TO postgres;

--
-- TOC entry 5509 (class 0 OID 0)
-- Dependencies: 351
-- Name: report_field_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_field_definitions_id_seq OWNED BY public.report_field_definitions.id;


--
-- TOC entry 348 (class 1259 OID 19661)
-- Name: report_record_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_record_definitions (
    id integer NOT NULL,
    record_name character varying(100) NOT NULL,
    display_name character varying(255) NOT NULL,
    description text,
    source_type character varying(20) NOT NULL,
    source_name character varying(100) NOT NULL,
    category character varying(100) NOT NULL,
    is_tenant_filtered boolean DEFAULT true,
    tenant_id_column character varying(100) DEFAULT 'tenant_id'::character varying,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_record_definitions_source_type_check CHECK (((source_type)::text = ANY (ARRAY[('table'::character varying)::text, ('view'::character varying)::text])))
);


ALTER TABLE public.report_record_definitions OWNER TO postgres;

--
-- TOC entry 349 (class 1259 OID 19676)
-- Name: report_record_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.report_record_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_record_definitions_id_seq OWNER TO postgres;

--
-- TOC entry 5510 (class 0 OID 0)
-- Dependencies: 349
-- Name: report_record_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.report_record_definitions_id_seq OWNED BY public.report_record_definitions.id;


--
-- TOC entry 353 (class 1259 OID 19741)
-- Name: report_run_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.report_run_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    report_id uuid,
    report_name character varying(255) NOT NULL,
    record_type character varying(100) NOT NULL,
    run_by uuid,
    row_count integer,
    execution_time_ms integer,
    exported_format character varying(20),
    run_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.report_run_history OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 17522)
-- Name: restaurant_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    menu_item_id uuid,
    name character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    modifications text[],
    special_instructions text,
    item_status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    CONSTRAINT restaurant_order_items_item_status_check CHECK (((item_status)::text = ANY ((ARRAY['pending'::character varying, 'preparing'::character varying, 'ready'::character varying, 'served'::character varying])::text[])))
);


ALTER TABLE public.restaurant_order_items OWNER TO postgres;

--
-- TOC entry 5511 (class 0 OID 0)
-- Dependencies: 271
-- Name: TABLE restaurant_order_items; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.restaurant_order_items IS 'Line items within restaurant orders';


--
-- TOC entry 270 (class 1259 OID 17481)
-- Name: restaurant_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurant_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    order_number character varying(50) NOT NULL,
    ticket_number integer,
    menu_id uuid,
    customer_name character varying(255),
    phone_number character varying(20),
    table_number character varying(50),
    order_type character varying(50) DEFAULT 'dine_in'::character varying,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    payment_method character varying(20),
    payment_intent_id character varying(255),
    payment_status character varying(20) DEFAULT 'unpaid'::character varying,
    cash_received numeric(10,2),
    change_given numeric(10,2),
    status public.restaurant_order_status DEFAULT 'entered'::public.restaurant_order_status,
    status_updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    kitchen_notes text,
    created_by uuid,
    completed_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reissue_count integer DEFAULT 0,
    CONSTRAINT restaurant_orders_order_type_check CHECK (((order_type)::text = ANY ((ARRAY['dine_in'::character varying, 'takeout'::character varying, 'delivery'::character varying])::text[]))),
    CONSTRAINT restaurant_orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['card'::character varying, 'cash'::character varying, 'split'::character varying, 'unpaid'::character varying])::text[]))),
    CONSTRAINT restaurant_orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['unpaid'::character varying, 'paid'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.restaurant_orders OWNER TO postgres;

--
-- TOC entry 5512 (class 0 OID 0)
-- Dependencies: 270
-- Name: TABLE restaurant_orders; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.restaurant_orders IS 'Restaurant POS orders with kitchen workflow status tracking';


--
-- TOC entry 5513 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN restaurant_orders.ticket_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurant_orders.ticket_number IS 'Short number for kitchen display (resets daily)';


--
-- TOC entry 5514 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN restaurant_orders.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.restaurant_orders.status IS 'Order workflow: entered -> in_process -> done -> complete';


--
-- TOC entry 341 (class 1259 OID 18697)
-- Name: sale_fee_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_fee_types (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(100) NOT NULL,
    description text,
    default_amount numeric(12,2),
    is_percentage boolean DEFAULT false,
    percentage_rate numeric(5,4),
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sale_fee_types OWNER TO postgres;

--
-- TOC entry 317 (class 1259 OID 18415)
-- Name: sale_fee_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_fee_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_fee_types_id_seq OWNER TO postgres;

--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 317
-- Name: sale_fee_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_fee_types_id_seq OWNED BY public.sale_fee_types.id;


--
-- TOC entry 340 (class 1259 OID 18687)
-- Name: sale_ticket_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_ticket_fees (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    sale_ticket_id integer NOT NULL,
    fee_type character varying(100) NOT NULL,
    description text,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sale_ticket_fees OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 18416)
-- Name: sale_ticket_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_ticket_fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_ticket_fees_id_seq OWNER TO postgres;

--
-- TOC entry 5516 (class 0 OID 0)
-- Dependencies: 318
-- Name: sale_ticket_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_ticket_fees_id_seq OWNED BY public.sale_ticket_fees.id;


--
-- TOC entry 339 (class 1259 OID 18676)
-- Name: sale_ticket_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_ticket_items (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    sale_ticket_id integer NOT NULL,
    animal_id integer,
    ear_tag character varying(50) NOT NULL,
    animal_name character varying(100),
    animal_type character varying(50),
    breed character varying(100),
    head_count integer DEFAULT 1,
    weight_lbs numeric(8,2),
    price_per_lb numeric(8,4),
    price_per_head numeric(12,2),
    line_total numeric(12,2) NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sale_ticket_items OWNER TO postgres;

--
-- TOC entry 319 (class 1259 OID 18417)
-- Name: sale_ticket_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_ticket_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_ticket_items_id_seq OWNER TO postgres;

--
-- TOC entry 5517 (class 0 OID 0)
-- Dependencies: 319
-- Name: sale_ticket_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_ticket_items_id_seq OWNED BY public.sale_ticket_items.id;


--
-- TOC entry 338 (class 1259 OID 18661)
-- Name: sale_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_tickets (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    ticket_number character varying(50),
    sale_date date NOT NULL,
    sold_to character varying(200) NOT NULL,
    buyer_contact text,
    gross_amount numeric(12,2) DEFAULT 0,
    total_fees numeric(12,2) DEFAULT 0,
    net_amount numeric(12,2) DEFAULT 0,
    payment_received boolean DEFAULT false,
    payment_date date,
    payment_reference character varying(100),
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sale_tickets OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 18418)
-- Name: sale_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_tickets_id_seq OWNER TO postgres;

--
-- TOC entry 5518 (class 0 OID 0)
-- Dependencies: 320
-- Name: sale_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_tickets_id_seq OWNED BY public.sale_tickets.id;


--
-- TOC entry 346 (class 1259 OID 19618)
-- Name: site_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_assets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    filename character varying(255) NOT NULL,
    original_filename character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_url character varying(500) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    width integer,
    height integer,
    thumbnail_url character varying(500),
    alt_text character varying(255),
    title character varying(255),
    caption text,
    folder character varying(255) DEFAULT 'uploads'::character varying,
    tags text[] DEFAULT '{}'::text[],
    category character varying(50),
    usage_count integer DEFAULT 0,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_assets OWNER TO postgres;

--
-- TOC entry 329 (class 1259 OID 18530)
-- Name: site_pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    page_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    is_system_page boolean DEFAULT false,
    is_published boolean DEFAULT false,
    published_at timestamp with time zone,
    seo_title character varying(255),
    seo_description text,
    seo_image character varying(500),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    template_id uuid,
    is_homepage boolean DEFAULT false
);


ALTER TABLE public.site_pages OWNER TO postgres;

--
-- TOC entry 344 (class 1259 OID 19580)
-- Name: site_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    preview_image character varying(500),
    template_type character varying(50) DEFAULT 'page'::character varying NOT NULL,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_templates OWNER TO postgres;

--
-- TOC entry 347 (class 1259 OID 19656)
-- Name: site_page_details; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.site_page_details AS
 SELECT p.id,
    p.tenant_id,
    p.page_type,
    p.title,
    p.slug,
    p.is_published,
    p.is_homepage,
    p.template_id,
    t.name AS template_name,
    t.slug AS template_slug,
    p.seo_title,
    p.seo_description,
    p.created_at,
    p.updated_at
   FROM (public.site_pages p
     LEFT JOIN public.site_templates t ON ((p.template_id = t.id)));


ALTER VIEW public.site_page_details OWNER TO postgres;

--
-- TOC entry 322 (class 1259 OID 18428)
-- Name: site_themes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_themes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    preview_image character varying(500),
    default_colors jsonb DEFAULT '{"text": "#333333", "accent": "#d4a574", "border": "#e0e0e0", "primary": "#4a6741", "secondary": "#8b7355", "textLight": "#666666", "background": "#fdfbf7"}'::jsonb,
    default_fonts jsonb DEFAULT '{"body": "Open Sans", "heading": "Playfair Display"}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_themes OWNER TO postgres;

--
-- TOC entry 333 (class 1259 OID 18592)
-- Name: social_connections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    platform_id uuid NOT NULL,
    account_name character varying(255),
    account_id character varying(255),
    account_type character varying(50),
    profile_image_url text,
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    last_verified_at timestamp with time zone,
    connected_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.social_connections OWNER TO postgres;

--
-- TOC entry 323 (class 1259 OID 18443)
-- Name: social_platforms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_platforms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    icon character varying(50),
    supports_images boolean DEFAULT true,
    supports_video boolean DEFAULT false,
    supports_links boolean DEFAULT true,
    supports_scheduling boolean DEFAULT true,
    max_characters integer,
    max_images integer DEFAULT 4,
    is_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.social_platforms OWNER TO postgres;

--
-- TOC entry 335 (class 1259 OID 18620)
-- Name: social_post_platforms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_post_platforms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    social_post_id uuid NOT NULL,
    connection_id uuid NOT NULL,
    content_override text,
    status character varying(20) DEFAULT 'pending'::character varying,
    published_at timestamp with time zone,
    platform_post_id character varying(255),
    platform_post_url text,
    error_message text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    clicks_count integer DEFAULT 0,
    impressions_count integer DEFAULT 0,
    last_analytics_update timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.social_post_platforms OWNER TO postgres;

--
-- TOC entry 334 (class 1259 OID 18606)
-- Name: social_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    content text NOT NULL,
    media_urls jsonb DEFAULT '[]'::jsonb,
    link_url text,
    link_title character varying(255),
    link_description text,
    link_image_url text,
    blog_post_id uuid,
    scheduled_for timestamp with time zone,
    posted_at timestamp with time zone,
    is_recurring boolean DEFAULT false,
    recurrence_rule character varying(255),
    recurrence_end_date date,
    parent_post_id uuid,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.social_posts OWNER TO postgres;

--
-- TOC entry 357 (class 1259 OID 19835)
-- Name: stripe_application_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stripe_application_fees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    stripe_fee_id character varying(255) NOT NULL,
    stripe_charge_id character varying(255),
    stripe_payment_intent_id character varying(255),
    amount integer NOT NULL,
    currency character varying(10) DEFAULT 'usd'::character varying,
    refunded_amount integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stripe_application_fees OWNER TO postgres;

--
-- TOC entry 5519 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE stripe_application_fees; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stripe_application_fees IS 'Tracks application fees collected from connected accounts';


--
-- TOC entry 356 (class 1259 OID 19813)
-- Name: stripe_terminal_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stripe_terminal_locations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    stripe_location_id character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    address_line1 character varying(255),
    address_city character varying(100),
    address_state character varying(50),
    address_postal_code character varying(20),
    address_country character varying(10) DEFAULT 'US'::character varying,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stripe_terminal_locations OWNER TO postgres;

--
-- TOC entry 5520 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE stripe_terminal_locations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stripe_terminal_locations IS 'Tracks Stripe Terminal locations registered to each tenant connected account';


--
-- TOC entry 355 (class 1259 OID 19792)
-- Name: stripe_terminal_readers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stripe_terminal_readers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    stripe_reader_id character varying(255) NOT NULL,
    stripe_location_id character varying(255),
    label character varying(255),
    device_type character varying(100),
    serial_number character varying(255),
    status character varying(50) DEFAULT 'online'::character varying,
    last_seen_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stripe_terminal_readers OWNER TO postgres;

--
-- TOC entry 5521 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE stripe_terminal_readers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.stripe_terminal_readers IS 'Tracks Stripe Terminal readers registered to each tenant connected account';


--
-- TOC entry 360 (class 1259 OID 19899)
-- Name: subscription_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    event_type character varying(50) NOT NULL,
    stripe_event_id character varying(255),
    previous_status character varying(50),
    new_status character varying(50),
    plan_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscription_events OWNER TO postgres;

--
-- TOC entry 5522 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE subscription_events; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.subscription_events IS 'Audit log of subscription changes';


--
-- TOC entry 359 (class 1259 OID 19864)
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    price_monthly integer NOT NULL,
    price_yearly integer,
    stripe_product_id character varying(255),
    stripe_price_monthly_id character varying(255),
    stripe_price_yearly_id character varying(255),
    features jsonb DEFAULT '{}'::jsonb,
    max_users integer DEFAULT 5,
    max_locations integer DEFAULT 1,
    max_products integer DEFAULT 100,
    max_monthly_orders integer DEFAULT 500,
    includes_pos boolean DEFAULT true,
    includes_restaurant_pos boolean DEFAULT false,
    includes_ecommerce boolean DEFAULT false,
    includes_herds_flocks boolean DEFAULT false,
    includes_accounting boolean DEFAULT true,
    includes_reports boolean DEFAULT true,
    includes_api_access boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    limits jsonb DEFAULT '{}'::jsonb,
    tier_level integer
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- TOC entry 5523 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE subscription_plans; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.subscription_plans IS 'SaaS subscription plan definitions';


--
-- TOC entry 223 (class 1259 OID 16506)
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16505)
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

--
-- TOC entry 5524 (class 0 OID 0)
-- Dependencies: 222
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- TOC entry 345 (class 1259 OID 19595)
-- Name: template_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_zones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    zone_key character varying(50) NOT NULL,
    zone_name character varying(100) NOT NULL,
    description text,
    allowed_blocks text[] DEFAULT '{}'::text[],
    max_blocks integer,
    min_blocks integer DEFAULT 0,
    display_order integer DEFAULT 0,
    default_blocks jsonb DEFAULT '[]'::jsonb,
    settings_schema jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.template_zones OWNER TO postgres;

--
-- TOC entry 366 (class 1259 OID 20228)
-- Name: tenant_app_access; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_app_access (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    app_id uuid NOT NULL,
    is_enabled boolean DEFAULT true,
    granted_override boolean DEFAULT false,
    last_accessed_at timestamp with time zone,
    access_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tenant_app_access OWNER TO postgres;

--
-- TOC entry 354 (class 1259 OID 19764)
-- Name: tenant_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_assets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    asset_type character varying(50) NOT NULL,
    filename character varying(255) NOT NULL,
    mime_type character varying(100) NOT NULL,
    data bytea NOT NULL,
    file_size integer NOT NULL,
    width integer,
    height integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tenant_assets OWNER TO postgres;

--
-- TOC entry 5525 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE tenant_assets; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tenant_assets IS 'Stores tenant branding assets (logos, favicons) in database for serverless deployments';


--
-- TOC entry 5526 (class 0 OID 0)
-- Dependencies: 354
-- Name: COLUMN tenant_assets.asset_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenant_assets.asset_type IS 'Type of asset: logo, favicon, og_image, email_header, etc.';


--
-- TOC entry 5527 (class 0 OID 0)
-- Dependencies: 354
-- Name: COLUMN tenant_assets.data; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenant_assets.data IS 'Binary file data stored as bytea';


--
-- TOC entry 332 (class 1259 OID 18574)
-- Name: tenant_site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant_site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    theme_id uuid,
    site_name character varying(255),
    tagline character varying(255),
    logo_url character varying(500),
    favicon_url character varying(500),
    color_overrides jsonb DEFAULT '{}'::jsonb,
    font_overrides jsonb DEFAULT '{}'::jsonb,
    contact_info jsonb DEFAULT '{"email": "", "phone": "", "address": ""}'::jsonb,
    social_links jsonb DEFAULT '{"twitter": "", "facebook": "", "linkedin": "", "instagram": ""}'::jsonb,
    business_hours jsonb DEFAULT '[]'::jsonb,
    default_seo_title character varying(255),
    default_seo_description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tenant_site_settings OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 17145)
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    plan character varying(50) DEFAULT 'starter'::character varying,
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255),
    subscription_status character varying(50) DEFAULT 'trialing'::character varying,
    logo_url text,
    primary_color character varying(20) DEFAULT '#2d5016'::character varying,
    domain character varying(255),
    email character varying(255),
    phone character varying(50),
    address text,
    city character varying(100),
    state character varying(50),
    zip_code character varying(20),
    settings jsonb DEFAULT '{}'::jsonb,
    features jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    onboarding_complete boolean DEFAULT false,
    description text,
    stripe_account_id character varying(255),
    stripe_account_status character varying(50) DEFAULT 'not_connected'::character varying,
    stripe_onboarding_complete boolean DEFAULT false,
    stripe_payouts_enabled boolean DEFAULT false,
    stripe_charges_enabled boolean DEFAULT false,
    stripe_details_submitted boolean DEFAULT false,
    stripe_requirements jsonb DEFAULT '{}'::jsonb,
    stripe_account_type character varying(50) DEFAULT 'express'::character varying,
    stripe_connected_at timestamp with time zone,
    subscription_plan_id uuid,
    subscription_interval character varying(20) DEFAULT 'monthly'::character varying,
    subscription_started_at timestamp with time zone,
    subscription_ends_at timestamp with time zone,
    subscription_cancelled_at timestamp with time zone,
    trial_ends_at timestamp with time zone,
    billing_interval character varying(20) DEFAULT 'monthly'::character varying,
    billing_email character varying(255),
    secondary_color character varying(7) DEFAULT '#4a7c59'::character varying,
    business_hours jsonb DEFAULT '{"friday": {"open": "09:00", "close": "17:00", "closed": false}, "monday": {"open": "09:00", "close": "17:00", "closed": false}, "sunday": {"open": "", "close": "", "closed": true}, "tuesday": {"open": "09:00", "close": "17:00", "closed": false}, "saturday": {"open": "10:00", "close": "14:00", "closed": false}, "thursday": {"open": "09:00", "close": "17:00", "closed": false}, "wednesday": {"open": "09:00", "close": "17:00", "closed": false}}'::jsonb,
    tax_rate numeric(5,4) DEFAULT 0.0825,
    currency character varying(3) DEFAULT 'USD'::character varying,
    timezone character varying(50) DEFAULT 'America/Chicago'::character varying,
    CONSTRAINT chk_tenants_stripe_account_status CHECK (((stripe_account_status)::text = ANY ((ARRAY['not_connected'::character varying, 'pending'::character varying, 'onboarding'::character varying, 'restricted'::character varying, 'active'::character varying])::text[]))),
    CONSTRAINT chk_tenants_subscription_status CHECK (((subscription_status IS NULL) OR ((subscription_status)::text = ANY ((ARRAY['trialing'::character varying, 'active'::character varying, 'past_due'::character varying, 'canceled'::character varying, 'unpaid'::character varying, 'incomplete'::character varying, 'incomplete_expired'::character varying, 'paused'::character varying])::text[]))))
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- TOC entry 5528 (class 0 OID 0)
-- Dependencies: 264
-- Name: TABLE tenants; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.tenants IS 'Multi-tenant support - each tenant is a separate business/farm';


--
-- TOC entry 5529 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_account_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_account_id IS 'Stripe Connect Account ID (acct_xxx)';


--
-- TOC entry 5530 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_account_status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_account_status IS 'Status: not_connected, pending, onboarding, restricted, active';


--
-- TOC entry 5531 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_onboarding_complete; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_onboarding_complete IS 'Whether Stripe onboarding flow is complete';


--
-- TOC entry 5532 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_payouts_enabled; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_payouts_enabled IS 'Whether payouts are enabled on the connected account';


--
-- TOC entry 5533 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_charges_enabled; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_charges_enabled IS 'Whether the account can accept charges';


--
-- TOC entry 5534 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_details_submitted; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_details_submitted IS 'Whether all required details have been submitted to Stripe';


--
-- TOC entry 5535 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_requirements; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_requirements IS 'JSONB of pending requirements from Stripe';


--
-- TOC entry 5536 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_account_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_account_type IS 'Type of Stripe Connect account (express, standard, custom)';


--
-- TOC entry 5537 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN tenants.stripe_connected_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tenants.stripe_connected_at IS 'When the Stripe account was first connected';


--
-- TOC entry 331 (class 1259 OID 18560)
-- Name: theme_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.theme_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    theme_id uuid NOT NULL,
    page_type character varying(50) NOT NULL,
    section_type character varying(50) NOT NULL,
    section_name character varying(100) NOT NULL,
    description text,
    default_sort_order integer DEFAULT 0,
    default_enabled boolean DEFAULT true,
    settings_schema jsonb NOT NULL,
    default_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.theme_sections OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16766)
-- Name: trailer_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trailer_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    trailer_order_id uuid NOT NULL,
    menu_item_id uuid,
    name character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    modifiers text,
    line_total numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trailer_order_items OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16816)
-- Name: trailer_order_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trailer_order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trailer_order_number_seq OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16748)
-- Name: trailer_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trailer_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(50) NOT NULL,
    customer_name character varying(255),
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    tip_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    payment_method character varying(50),
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    notes text,
    ordered_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid NOT NULL
);


ALTER TABLE public.trailer_orders OWNER TO postgres;

--
-- TOC entry 5538 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN trailer_orders.tenant_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trailer_orders.tenant_id IS 'Multi-tenant: Trailer sales orders scoped to tenant';


--
-- TOC entry 250 (class 1259 OID 17003)
-- Name: trial_balance; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.trial_balance AS
 SELECT account_code,
    name,
    account_type,
    normal_balance,
        CASE
            WHEN ((normal_balance)::text = 'debit'::text) THEN current_balance
            ELSE (0)::numeric
        END AS debit_balance,
        CASE
            WHEN ((normal_balance)::text = 'credit'::text) THEN current_balance
            ELSE (0)::numeric
        END AS credit_balance,
    current_balance
   FROM public.accounts_chart ac
  WHERE (is_active = true)
  ORDER BY account_code;


ALTER VIEW public.trial_balance OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 17076)
-- Name: v_account_balances; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_account_balances AS
 SELECT ac.id AS account_id,
    ac.account_code,
    ac.name AS account_name,
    ac.account_type,
    ac.account_subtype,
    ac.normal_balance,
    COALESCE(sum(jel.debit), (0)::numeric) AS total_debits,
    COALESCE(sum(jel.credit), (0)::numeric) AS total_credits,
        CASE
            WHEN ((ac.normal_balance)::text = 'debit'::text) THEN (COALESCE(sum(jel.debit), (0)::numeric) - COALESCE(sum(jel.credit), (0)::numeric))
            ELSE (COALESCE(sum(jel.credit), (0)::numeric) - COALESCE(sum(jel.debit), (0)::numeric))
        END AS balance
   FROM ((public.accounts_chart ac
     LEFT JOIN public.journal_entry_lines jel ON ((ac.id = jel.account_id)))
     LEFT JOIN public.journal_entries je ON (((jel.journal_entry_id = je.id) AND (je.status = 'posted'::public.journal_status))))
  GROUP BY ac.id, ac.account_code, ac.name, ac.account_type, ac.account_subtype, ac.normal_balance;


ALTER VIEW public.v_account_balances OWNER TO postgres;

--
-- TOC entry 309 (class 1259 OID 18020)
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO postgres;

--
-- TOC entry 5539 (class 0 OID 0)
-- Dependencies: 309
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- TOC entry 4155 (class 2604 OID 18422)
-- Name: _migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._migrations ALTER COLUMN id SET DEFAULT nextval('public._migrations_id_seq'::regclass);


--
-- TOC entry 3955 (class 2604 OID 16895)
-- Name: accounts_chart id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts_chart ALTER COLUMN id SET DEFAULT nextval('public.accounts_chart_id_seq'::regclass);


--
-- TOC entry 4093 (class 2604 OID 17669)
-- Name: animal_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_categories ALTER COLUMN id SET DEFAULT nextval('public.animal_categories_id_seq'::regclass);


--
-- TOC entry 4117 (class 2604 OID 17836)
-- Name: animal_health_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_health_records ALTER COLUMN id SET DEFAULT nextval('public.animal_health_records_id_seq'::regclass);


--
-- TOC entry 4096 (class 2604 OID 17687)
-- Name: animal_owners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_owners ALTER COLUMN id SET DEFAULT nextval('public.animal_owners_id_seq'::regclass);


--
-- TOC entry 4110 (class 2604 OID 17788)
-- Name: animal_sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_sales ALTER COLUMN id SET DEFAULT nextval('public.animal_sales_id_seq'::regclass);


--
-- TOC entry 4085 (class 2604 OID 17631)
-- Name: animal_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_types ALTER COLUMN id SET DEFAULT nextval('public.animal_types_id_seq'::regclass);


--
-- TOC entry 4114 (class 2604 OID 17813)
-- Name: animal_weights id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_weights ALTER COLUMN id SET DEFAULT nextval('public.animal_weights_id_seq'::regclass);


--
-- TOC entry 4105 (class 2604 OID 17727)
-- Name: animals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals ALTER COLUMN id SET DEFAULT nextval('public.animals_id_seq'::regclass);


--
-- TOC entry 3893 (class 2604 OID 16603)
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- TOC entry 4089 (class 2604 OID 17650)
-- Name: breeds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds ALTER COLUMN id SET DEFAULT nextval('public.breeds_id_seq'::regclass);


--
-- TOC entry 4173 (class 2604 OID 18461)
-- Name: buyers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyers ALTER COLUMN id SET DEFAULT nextval('public.buyers_id_seq'::regclass);


--
-- TOC entry 3863 (class 2604 OID 16492)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3980 (class 2604 OID 17024)
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- TOC entry 3964 (class 2604 OID 16921)
-- Name: fiscal_periods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiscal_periods ALTER COLUMN id SET DEFAULT nextval('public.fiscal_periods_id_seq'::regclass);


--
-- TOC entry 4124 (class 2604 OID 17883)
-- Name: grazing_event_animals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grazing_event_animals ALTER COLUMN id SET DEFAULT nextval('public.grazing_event_animals_id_seq'::regclass);


--
-- TOC entry 4433 (class 2604 OID 20618)
-- Name: herd_event_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_event_types ALTER COLUMN id SET DEFAULT nextval('public.herd_event_types_id_seq'::regclass);


--
-- TOC entry 4436 (class 2604 OID 20637)
-- Name: herd_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_events ALTER COLUMN id SET DEFAULT nextval('public.herd_events_id_seq'::regclass);


--
-- TOC entry 4148 (class 2604 OID 18118)
-- Name: herds_flocks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herds_flocks ALTER COLUMN id SET DEFAULT nextval('public.herds_flocks_id_seq'::regclass);


--
-- TOC entry 4078 (class 2604 OID 17570)
-- Name: menu_item_modifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifications ALTER COLUMN id SET DEFAULT nextval('public.menu_item_modifications_id_seq'::regclass);


--
-- TOC entry 4070 (class 2604 OID 17556)
-- Name: modifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifications ALTER COLUMN id SET DEFAULT nextval('public.modifications_id_seq'::regclass);


--
-- TOC entry 4120 (class 2604 OID 17859)
-- Name: pasture_grazing_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_grazing_events ALTER COLUMN id SET DEFAULT nextval('public.pasture_grazing_events_id_seq'::regclass);


--
-- TOC entry 4130 (class 2604 OID 17932)
-- Name: pasture_nutrients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_nutrients ALTER COLUMN id SET DEFAULT nextval('public.pasture_nutrients_id_seq'::regclass);


--
-- TOC entry 4126 (class 2604 OID 17908)
-- Name: pasture_soil_samples id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_soil_samples ALTER COLUMN id SET DEFAULT nextval('public.pasture_soil_samples_id_seq'::regclass);


--
-- TOC entry 4133 (class 2604 OID 17952)
-- Name: pasture_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_tasks ALTER COLUMN id SET DEFAULT nextval('public.pasture_tasks_id_seq'::regclass);


--
-- TOC entry 4138 (class 2604 OID 17978)
-- Name: pasture_treatments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_treatments ALTER COLUMN id SET DEFAULT nextval('public.pasture_treatments_id_seq'::regclass);


--
-- TOC entry 4100 (class 2604 OID 17706)
-- Name: pastures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pastures ALTER COLUMN id SET DEFAULT nextval('public.pastures_id_seq'::regclass);


--
-- TOC entry 3993 (class 2604 OID 17100)
-- Name: plaid_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plaid_accounts ALTER COLUMN id SET DEFAULT nextval('public.plaid_accounts_id_seq'::regclass);


--
-- TOC entry 3989 (class 2604 OID 17090)
-- Name: plaid_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plaid_items ALTER COLUMN id SET DEFAULT nextval('public.plaid_items_id_seq'::regclass);


--
-- TOC entry 4250 (class 2604 OID 18641)
-- Name: processing_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processing_records ALTER COLUMN id SET DEFAULT nextval('public.processing_records_id_seq'::regclass);


--
-- TOC entry 4255 (class 2604 OID 18654)
-- Name: rainfall_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rainfall_records ALTER COLUMN id SET DEFAULT nextval('public.rainfall_records_id_seq'::regclass);


--
-- TOC entry 3984 (class 2604 OID 17059)
-- Name: report_configurations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_configurations ALTER COLUMN id SET DEFAULT nextval('public.report_configurations_id_seq'::regclass);


--
-- TOC entry 4314 (class 2604 OID 19702)
-- Name: report_field_definitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_field_definitions ALTER COLUMN id SET DEFAULT nextval('public.report_field_definitions_id_seq'::regclass);


--
-- TOC entry 4308 (class 2604 OID 19677)
-- Name: report_record_definitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_record_definitions ALTER COLUMN id SET DEFAULT nextval('public.report_record_definitions_id_seq'::regclass);


--
-- TOC entry 4273 (class 2604 OID 18700)
-- Name: sale_fee_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_fee_types ALTER COLUMN id SET DEFAULT nextval('public.sale_fee_types_id_seq'::regclass);


--
-- TOC entry 4270 (class 2604 OID 18690)
-- Name: sale_ticket_fees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_fees ALTER COLUMN id SET DEFAULT nextval('public.sale_ticket_fees_id_seq'::regclass);


--
-- TOC entry 4266 (class 2604 OID 18679)
-- Name: sale_ticket_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_items ALTER COLUMN id SET DEFAULT nextval('public.sale_ticket_items_id_seq'::regclass);


--
-- TOC entry 4258 (class 2604 OID 18664)
-- Name: sale_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_tickets ALTER COLUMN id SET DEFAULT nextval('public.sale_tickets_id_seq'::regclass);


--
-- TOC entry 3870 (class 2604 OID 16509)
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- TOC entry 4142 (class 2604 OID 18024)
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- TOC entry 4771 (class 2606 OID 18427)
-- Name: _migrations _migrations_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_name_key UNIQUE (name);


--
-- TOC entry 4773 (class 2606 OID 18425)
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4565 (class 2606 OID 16906)
-- Name: accounts_chart accounts_chart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts_chart
    ADD CONSTRAINT accounts_chart_pkey PRIMARY KEY (id);


--
-- TOC entry 4567 (class 2606 OID 17245)
-- Name: accounts_chart accounts_chart_tenant_account_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts_chart
    ADD CONSTRAINT accounts_chart_tenant_account_code_unique UNIQUE (tenant_id, account_code);


--
-- TOC entry 4469 (class 2606 OID 16476)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 4471 (class 2606 OID 17247)
-- Name: accounts accounts_tenant_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_tenant_email_unique UNIQUE (tenant_id, email);


--
-- TOC entry 5540 (class 0 OID 0)
-- Dependencies: 4471
-- Name: CONSTRAINT accounts_tenant_email_unique ON accounts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT accounts_tenant_email_unique ON public.accounts IS 'Email must be unique within each tenant, but can be reused across tenants';


--
-- TOC entry 4695 (class 2606 OID 17675)
-- Name: animal_categories animal_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_categories
    ADD CONSTRAINT animal_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4697 (class 2606 OID 17677)
-- Name: animal_categories animal_categories_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_categories
    ADD CONSTRAINT animal_categories_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4730 (class 2606 OID 17842)
-- Name: animal_health_records animal_health_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_health_records
    ADD CONSTRAINT animal_health_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4699 (class 2606 OID 17694)
-- Name: animal_owners animal_owners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_owners
    ADD CONSTRAINT animal_owners_pkey PRIMARY KEY (id);


--
-- TOC entry 4701 (class 2606 OID 17696)
-- Name: animal_owners animal_owners_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_owners
    ADD CONSTRAINT animal_owners_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4721 (class 2606 OID 17795)
-- Name: animal_sales animal_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_sales
    ADD CONSTRAINT animal_sales_pkey PRIMARY KEY (id);


--
-- TOC entry 4687 (class 2606 OID 17638)
-- Name: animal_types animal_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_types
    ADD CONSTRAINT animal_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4689 (class 2606 OID 17640)
-- Name: animal_types animal_types_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_types
    ADD CONSTRAINT animal_types_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4726 (class 2606 OID 17819)
-- Name: animal_weights animal_weights_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_weights
    ADD CONSTRAINT animal_weights_pkey PRIMARY KEY (id);


--
-- TOC entry 4708 (class 2606 OID 17735)
-- Name: animals animals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_pkey PRIMARY KEY (id);


--
-- TOC entry 4710 (class 2606 OID 18979)
-- Name: animals animals_tenant_id_ear_tag_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_tenant_id_ear_tag_key UNIQUE (tenant_id, ear_tag);


--
-- TOC entry 4981 (class 2606 OID 20225)
-- Name: app_registry app_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_registry
    ADD CONSTRAINT app_registry_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 20227)
-- Name: app_registry app_registry_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_registry
    ADD CONSTRAINT app_registry_slug_key UNIQUE (slug);


--
-- TOC entry 5004 (class 2606 OID 20384)
-- Name: asset_depreciation_schedule asset_depr_asset_period_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_asset_period_unique UNIQUE (fixed_asset_id, period_number);


--
-- TOC entry 5006 (class 2606 OID 20382)
-- Name: asset_depreciation_schedule asset_depreciation_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depreciation_schedule_pkey PRIMARY KEY (id);


--
-- TOC entry 4557 (class 2606 OID 16794)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4512 (class 2606 OID 16607)
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 4964 (class 2606 OID 19960)
-- Name: block_types block_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.block_types
    ADD CONSTRAINT block_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4610 (class 2606 OID 17133)
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4612 (class 2606 OID 18990)
-- Name: blog_posts blog_posts_tenant_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_tenant_slug_key UNIQUE (tenant_id, slug);


--
-- TOC entry 4691 (class 2606 OID 17657)
-- Name: breeds breeds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_pkey PRIMARY KEY (id);


--
-- TOC entry 4693 (class 2606 OID 17659)
-- Name: breeds breeds_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4781 (class 2606 OID 18469)
-- Name: buyers buyers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_pkey PRIMARY KEY (id);


--
-- TOC entry 4783 (class 2606 OID 18471)
-- Name: buyers buyers_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4478 (class 2606 OID 16502)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 4480 (class 2606 OID 16500)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4482 (class 2606 OID 16504)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 4591 (class 2606 OID 17032)
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- TOC entry 4593 (class 2606 OID 20464)
-- Name: classes classes_tenant_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_tenant_name_unique UNIQUE (tenant_id, name);


--
-- TOC entry 4919 (class 2606 OID 19724)
-- Name: custom_reports custom_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_reports
    ADD CONSTRAINT custom_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 19726)
-- Name: custom_reports custom_reports_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_reports
    ADD CONSTRAINT custom_reports_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4465 (class 2606 OID 16461)
-- Name: delivery_zones delivery_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 18484)
-- Name: event_series event_series_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_series
    ADD CONSTRAINT event_series_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 18499)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 4791 (class 2606 OID 18501)
-- Name: events events_tenant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tenant_id_slug_key UNIQUE (tenant_id, slug);


--
-- TOC entry 4573 (class 2606 OID 16925)
-- Name: fiscal_periods fiscal_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 20317)
-- Name: fixed_assets fixed_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4997 (class 2606 OID 20319)
-- Name: fixed_assets fixed_assets_tenant_asset_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_tenant_asset_number_unique UNIQUE (tenant_id, asset_number);


--
-- TOC entry 4976 (class 2606 OID 20182)
-- Name: global_block_instances global_block_instances_global_block_id_page_id_zone_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_block_instances
    ADD CONSTRAINT global_block_instances_global_block_id_page_id_zone_key_key UNIQUE (global_block_id, page_id, zone_key);


--
-- TOC entry 4978 (class 2606 OID 20180)
-- Name: global_block_instances global_block_instances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_block_instances
    ADD CONSTRAINT global_block_instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 20160)
-- Name: global_blocks global_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_blocks
    ADD CONSTRAINT global_blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 20162)
-- Name: global_blocks global_blocks_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_blocks
    ADD CONSTRAINT global_blocks_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4738 (class 2606 OID 17888)
-- Name: grazing_event_animals grazing_event_animals_grazing_event_id_animal_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_grazing_event_id_animal_id_key UNIQUE (grazing_event_id, animal_id);


--
-- TOC entry 4740 (class 2606 OID 17886)
-- Name: grazing_event_animals grazing_event_animals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 20624)
-- Name: herd_event_types herd_event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_event_types
    ADD CONSTRAINT herd_event_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5018 (class 2606 OID 20643)
-- Name: herd_events herd_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_events
    ADD CONSTRAINT herd_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4765 (class 2606 OID 18126)
-- Name: herds_flocks herds_flocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herds_flocks
    ADD CONSTRAINT herds_flocks_pkey PRIMARY KEY (id);


--
-- TOC entry 4767 (class 2606 OID 18977)
-- Name: herds_flocks herds_flocks_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herds_flocks
    ADD CONSTRAINT herds_flocks_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4540 (class 2606 OID 16706)
-- Name: inventory_logs inventory_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4503 (class 2606 OID 16551)
-- Name: item_tags item_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_pkey PRIMARY KEY (item_id, tag_id);


--
-- TOC entry 4499 (class 2606 OID 16535)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- TOC entry 4501 (class 2606 OID 16537)
-- Name: items items_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_sku_key UNIQUE (sku);


--
-- TOC entry 4581 (class 2606 OID 16946)
-- Name: journal_entries journal_entries_entry_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_entry_number_key UNIQUE (entry_number);


--
-- TOC entry 4583 (class 2606 OID 16944)
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4589 (class 2606 OID 16981)
-- Name: journal_entry_lines journal_entry_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 4801 (class 2606 OID 18511)
-- Name: media_folders media_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 18513)
-- Name: media_folders media_folders_tenant_id_parent_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_tenant_id_parent_id_slug_key UNIQUE (tenant_id, parent_id, slug);


--
-- TOC entry 4810 (class 2606 OID 18529)
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- TOC entry 4510 (class 2606 OID 16574)
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- TOC entry 4547 (class 2606 OID 16737)
-- Name: menu_item_ingredients menu_item_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_ingredients
    ADD CONSTRAINT menu_item_ingredients_pkey PRIMARY KEY (id);


--
-- TOC entry 4683 (class 2606 OID 17578)
-- Name: menu_item_modifications menu_item_modifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifications
    ADD CONSTRAINT menu_item_modifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4685 (class 2606 OID 17580)
-- Name: menu_item_modifications menu_item_modifications_tenant_id_menu_item_id_modification_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifications
    ADD CONSTRAINT menu_item_modifications_tenant_id_menu_item_id_modification_key UNIQUE (tenant_id, menu_item_id, modification_id);


--
-- TOC entry 4545 (class 2606 OID 16730)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4642 (class 2606 OID 17396)
-- Name: menu_section_items menu_section_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_section_items
    ADD CONSTRAINT menu_section_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4644 (class 2606 OID 17398)
-- Name: menu_section_items menu_section_items_section_id_menu_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_section_items
    ADD CONSTRAINT menu_section_items_section_id_menu_item_id_key UNIQUE (section_id, menu_item_id);


--
-- TOC entry 4638 (class 2606 OID 17380)
-- Name: menu_sections menu_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 4632 (class 2606 OID 17350)
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- TOC entry 4634 (class 2606 OID 17352)
-- Name: menus menus_tenant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_tenant_id_slug_key UNIQUE (tenant_id, slug);


--
-- TOC entry 4679 (class 2606 OID 17565)
-- Name: modifications modifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifications
    ADD CONSTRAINT modifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4534 (class 2606 OID 16685)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4528 (class 2606 OID 16658)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 4530 (class 2606 OID 16656)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 20134)
-- Name: page_blocks page_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_blocks
    ADD CONSTRAINT page_blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 18559)
-- Name: page_sections page_sections_page_id_section_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_page_id_section_type_key UNIQUE (page_id, section_type);


--
-- TOC entry 4823 (class 2606 OID 18557)
-- Name: page_sections page_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 4736 (class 2606 OID 17866)
-- Name: pasture_grazing_events pasture_grazing_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_grazing_events
    ADD CONSTRAINT pasture_grazing_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4747 (class 2606 OID 17936)
-- Name: pasture_nutrients pasture_nutrients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_nutrients
    ADD CONSTRAINT pasture_nutrients_pkey PRIMARY KEY (id);


--
-- TOC entry 4744 (class 2606 OID 17915)
-- Name: pasture_soil_samples pasture_soil_samples_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_soil_samples
    ADD CONSTRAINT pasture_soil_samples_pkey PRIMARY KEY (id);


--
-- TOC entry 4752 (class 2606 OID 17960)
-- Name: pasture_tasks pasture_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_tasks
    ADD CONSTRAINT pasture_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4756 (class 2606 OID 17985)
-- Name: pasture_treatments pasture_treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_treatments
    ADD CONSTRAINT pasture_treatments_pkey PRIMARY KEY (id);


--
-- TOC entry 4704 (class 2606 OID 17714)
-- Name: pastures pastures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pastures
    ADD CONSTRAINT pastures_pkey PRIMARY KEY (id);


--
-- TOC entry 4706 (class 2606 OID 17716)
-- Name: pastures pastures_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pastures
    ADD CONSTRAINT pastures_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4608 (class 2606 OID 17104)
-- Name: plaid_accounts plaid_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plaid_accounts
    ADD CONSTRAINT plaid_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 4605 (class 2606 OID 17095)
-- Name: plaid_items plaid_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plaid_items
    ADD CONSTRAINT plaid_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4952 (class 2606 OID 19862)
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (key);


--
-- TOC entry 4891 (class 2606 OID 19100)
-- Name: pos_layout_items pos_layout_items_layout_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layout_items
    ADD CONSTRAINT pos_layout_items_layout_id_item_id_key UNIQUE (layout_id, item_id);


--
-- TOC entry 4893 (class 2606 OID 19098)
-- Name: pos_layout_items pos_layout_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layout_items
    ADD CONSTRAINT pos_layout_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 19073)
-- Name: pos_layouts pos_layouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layouts
    ADD CONSTRAINT pos_layouts_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 19075)
-- Name: pos_layouts pos_layouts_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layouts
    ADD CONSTRAINT pos_layouts_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4658 (class 2606 OID 17451)
-- Name: pos_order_items pos_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4652 (class 2606 OID 17431)
-- Name: pos_orders pos_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4654 (class 2606 OID 17433)
-- Name: pos_orders pos_orders_tenant_id_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_tenant_id_order_number_key UNIQUE (tenant_id, order_number);


--
-- TOC entry 4859 (class 2606 OID 18650)
-- Name: processing_records processing_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processing_records
    ADD CONSTRAINT processing_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 18660)
-- Name: rainfall_records rainfall_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rainfall_records
    ADD CONSTRAINT rainfall_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4599 (class 2606 OID 20468)
-- Name: report_configurations report_configs_tenant_type_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_configurations
    ADD CONSTRAINT report_configs_tenant_type_name_unique UNIQUE (tenant_id, report_type, name);


--
-- TOC entry 4601 (class 2606 OID 17067)
-- Name: report_configurations report_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_configurations
    ADD CONSTRAINT report_configurations_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 19693)
-- Name: report_field_definitions report_field_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_field_definitions
    ADD CONSTRAINT report_field_definitions_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 19695)
-- Name: report_field_definitions report_field_definitions_record_id_field_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_field_definitions
    ADD CONSTRAINT report_field_definitions_record_id_field_name_key UNIQUE (record_id, field_name);


--
-- TOC entry 4911 (class 2606 OID 19673)
-- Name: report_record_definitions report_record_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_record_definitions
    ADD CONSTRAINT report_record_definitions_pkey PRIMARY KEY (id);


--
-- TOC entry 4913 (class 2606 OID 19675)
-- Name: report_record_definitions report_record_definitions_record_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_record_definitions
    ADD CONSTRAINT report_record_definitions_record_name_key UNIQUE (record_name);


--
-- TOC entry 4927 (class 2606 OID 19747)
-- Name: report_run_history report_run_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_run_history
    ADD CONSTRAINT report_run_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4674 (class 2606 OID 17533)
-- Name: restaurant_order_items restaurant_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_order_items
    ADD CONSTRAINT restaurant_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4666 (class 2606 OID 17499)
-- Name: restaurant_orders restaurant_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4668 (class 2606 OID 17501)
-- Name: restaurant_orders restaurant_orders_tenant_id_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_tenant_id_order_number_key UNIQUE (tenant_id, order_number);


--
-- TOC entry 4877 (class 2606 OID 18709)
-- Name: sale_fee_types sale_fee_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_fee_types
    ADD CONSTRAINT sale_fee_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 18711)
-- Name: sale_fee_types sale_fee_types_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_fee_types
    ADD CONSTRAINT sale_fee_types_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4875 (class 2606 OID 18696)
-- Name: sale_ticket_fees sale_ticket_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_fees
    ADD CONSTRAINT sale_ticket_fees_pkey PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 18686)
-- Name: sale_ticket_items sale_ticket_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_items
    ADD CONSTRAINT sale_ticket_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4868 (class 2606 OID 18675)
-- Name: sale_tickets sale_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_tickets
    ADD CONSTRAINT sale_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 19631)
-- Name: site_assets site_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_assets
    ADD CONSTRAINT site_assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 18542)
-- Name: site_pages site_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_pages
    ADD CONSTRAINT site_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 18544)
-- Name: site_pages site_pages_tenant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_pages
    ADD CONSTRAINT site_pages_tenant_id_slug_key UNIQUE (tenant_id, slug);


--
-- TOC entry 4895 (class 2606 OID 19592)
-- Name: site_templates site_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_templates
    ADD CONSTRAINT site_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4897 (class 2606 OID 19594)
-- Name: site_templates site_templates_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_templates
    ADD CONSTRAINT site_templates_slug_key UNIQUE (slug);


--
-- TOC entry 4775 (class 2606 OID 18440)
-- Name: site_themes site_themes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_themes
    ADD CONSTRAINT site_themes_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 18442)
-- Name: site_themes site_themes_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_themes
    ADD CONSTRAINT site_themes_slug_key UNIQUE (slug);


--
-- TOC entry 4838 (class 2606 OID 18603)
-- Name: social_connections social_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_pkey PRIMARY KEY (id);


--
-- TOC entry 4840 (class 2606 OID 18605)
-- Name: social_connections social_connections_tenant_id_platform_id_account_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_tenant_id_platform_id_account_id_key UNIQUE (tenant_id, platform_id, account_id);


--
-- TOC entry 4779 (class 2606 OID 18457)
-- Name: social_platforms social_platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_platforms
    ADD CONSTRAINT social_platforms_pkey PRIMARY KEY (id);


--
-- TOC entry 4850 (class 2606 OID 18635)
-- Name: social_post_platforms social_post_platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_post_platforms
    ADD CONSTRAINT social_post_platforms_pkey PRIMARY KEY (id);


--
-- TOC entry 4852 (class 2606 OID 18637)
-- Name: social_post_platforms social_post_platforms_social_post_id_connection_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_post_platforms
    ADD CONSTRAINT social_post_platforms_social_post_id_connection_id_key UNIQUE (social_post_id, connection_id);


--
-- TOC entry 4846 (class 2606 OID 18619)
-- Name: social_posts social_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 19845)
-- Name: stripe_application_fees stripe_application_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_application_fees
    ADD CONSTRAINT stripe_application_fees_pkey PRIMARY KEY (id);


--
-- TOC entry 4950 (class 2606 OID 19847)
-- Name: stripe_application_fees stripe_application_fees_stripe_fee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_application_fees
    ADD CONSTRAINT stripe_application_fees_stripe_fee_id_key UNIQUE (stripe_fee_id);


--
-- TOC entry 4942 (class 2606 OID 19825)
-- Name: stripe_terminal_locations stripe_terminal_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_terminal_locations
    ADD CONSTRAINT stripe_terminal_locations_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 19827)
-- Name: stripe_terminal_locations stripe_terminal_locations_tenant_id_stripe_location_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_terminal_locations
    ADD CONSTRAINT stripe_terminal_locations_tenant_id_stripe_location_id_key UNIQUE (tenant_id, stripe_location_id);


--
-- TOC entry 4936 (class 2606 OID 19803)
-- Name: stripe_terminal_readers stripe_terminal_readers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_terminal_readers
    ADD CONSTRAINT stripe_terminal_readers_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 19805)
-- Name: stripe_terminal_readers stripe_terminal_readers_tenant_id_stripe_reader_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_terminal_readers
    ADD CONSTRAINT stripe_terminal_readers_tenant_id_stripe_reader_id_key UNIQUE (tenant_id, stripe_reader_id);


--
-- TOC entry 4962 (class 2606 OID 19908)
-- Name: subscription_events subscription_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_events
    ADD CONSTRAINT subscription_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4956 (class 2606 OID 19888)
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 19890)
-- Name: subscription_plans subscription_plans_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_slug_key UNIQUE (slug);


--
-- TOC entry 4485 (class 2606 OID 16512)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 4487 (class 2606 OID 18983)
-- Name: tags tags_tenant_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_tenant_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4489 (class 2606 OID 18981)
-- Name: tags tags_tenant_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_tenant_slug_key UNIQUE (tenant_id, slug);


--
-- TOC entry 4901 (class 2606 OID 19608)
-- Name: template_zones template_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_zones
    ADD CONSTRAINT template_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 4903 (class 2606 OID 19610)
-- Name: template_zones template_zones_template_id_zone_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_zones
    ADD CONSTRAINT template_zones_template_id_zone_key_key UNIQUE (template_id, zone_key);


--
-- TOC entry 4991 (class 2606 OID 20238)
-- Name: tenant_app_access tenant_app_access_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_app_access
    ADD CONSTRAINT tenant_app_access_pkey PRIMARY KEY (id);


--
-- TOC entry 4993 (class 2606 OID 20240)
-- Name: tenant_app_access tenant_app_access_tenant_id_app_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_app_access
    ADD CONSTRAINT tenant_app_access_tenant_id_app_id_key UNIQUE (tenant_id, app_id);


--
-- TOC entry 4930 (class 2606 OID 19773)
-- Name: tenant_assets tenant_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_assets
    ADD CONSTRAINT tenant_assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 19775)
-- Name: tenant_assets tenant_assets_tenant_id_asset_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_assets
    ADD CONSTRAINT tenant_assets_tenant_id_asset_type_key UNIQUE (tenant_id, asset_type);


--
-- TOC entry 4831 (class 2606 OID 18589)
-- Name: tenant_site_settings tenant_site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_site_settings
    ADD CONSTRAINT tenant_site_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 18591)
-- Name: tenant_site_settings tenant_site_settings_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_site_settings
    ADD CONSTRAINT tenant_site_settings_tenant_id_key UNIQUE (tenant_id);


--
-- TOC entry 4624 (class 2606 OID 17160)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 4626 (class 2606 OID 17162)
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- TOC entry 4827 (class 2606 OID 18571)
-- Name: theme_sections theme_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theme_sections
    ADD CONSTRAINT theme_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 18573)
-- Name: theme_sections theme_sections_theme_id_page_type_section_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theme_sections
    ADD CONSTRAINT theme_sections_theme_id_page_type_section_type_key UNIQUE (theme_id, page_type, section_type);


--
-- TOC entry 4555 (class 2606 OID 16775)
-- Name: trailer_order_items trailer_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_order_items
    ADD CONSTRAINT trailer_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4551 (class 2606 OID 16763)
-- Name: trailer_orders trailer_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_orders
    ADD CONSTRAINT trailer_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4553 (class 2606 OID 20466)
-- Name: trailer_orders trailer_orders_tenant_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_orders
    ADD CONSTRAINT trailer_orders_tenant_order_number_unique UNIQUE (tenant_id, order_number);


--
-- TOC entry 4521 (class 2606 OID 16618)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 20626)
-- Name: herd_event_types uq_herd_event_types_tenant_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_event_types
    ADD CONSTRAINT uq_herd_event_types_tenant_name UNIQUE (tenant_id, name);


--
-- TOC entry 4761 (class 2606 OID 18033)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 18035)
-- Name: vendors vendors_tenant_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_tenant_name_unique UNIQUE (tenant_id, name);


--
-- TOC entry 4568 (class 1259 OID 16914)
-- Name: idx_accounts_chart_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_chart_code ON public.accounts_chart USING btree (account_code);


--
-- TOC entry 4569 (class 1259 OID 16916)
-- Name: idx_accounts_chart_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_chart_parent ON public.accounts_chart USING btree (parent_id);


--
-- TOC entry 4570 (class 1259 OID 17208)
-- Name: idx_accounts_chart_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_chart_tenant ON public.accounts_chart USING btree (tenant_id);


--
-- TOC entry 4571 (class 1259 OID 16915)
-- Name: idx_accounts_chart_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_chart_type ON public.accounts_chart USING btree (account_type);


--
-- TOC entry 4472 (class 1259 OID 16484)
-- Name: idx_accounts_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_email ON public.accounts USING btree (email);


--
-- TOC entry 4473 (class 1259 OID 16486)
-- Name: idx_accounts_farm_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_farm_member ON public.accounts USING btree (is_farm_member);


--
-- TOC entry 4474 (class 1259 OID 16485)
-- Name: idx_accounts_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_role ON public.accounts USING btree (role);


--
-- TOC entry 4475 (class 1259 OID 17195)
-- Name: idx_accounts_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_tenant ON public.accounts USING btree (tenant_id);


--
-- TOC entry 4476 (class 1259 OID 16487)
-- Name: idx_accounts_zone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accounts_zone ON public.accounts USING btree (delivery_zone_id);


--
-- TOC entry 4731 (class 1259 OID 17854)
-- Name: idx_animal_health_animal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_health_animal ON public.animal_health_records USING btree (animal_id);


--
-- TOC entry 4732 (class 1259 OID 17853)
-- Name: idx_animal_health_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_health_tenant ON public.animal_health_records USING btree (tenant_id);


--
-- TOC entry 4722 (class 1259 OID 17807)
-- Name: idx_animal_sales_animal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_sales_animal ON public.animal_sales USING btree (animal_id);


--
-- TOC entry 4723 (class 1259 OID 17808)
-- Name: idx_animal_sales_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_sales_date ON public.animal_sales USING btree (sale_date);


--
-- TOC entry 4724 (class 1259 OID 17806)
-- Name: idx_animal_sales_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_sales_tenant ON public.animal_sales USING btree (tenant_id);


--
-- TOC entry 4727 (class 1259 OID 17831)
-- Name: idx_animal_weights_animal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_weights_animal ON public.animal_weights USING btree (animal_id);


--
-- TOC entry 4728 (class 1259 OID 17830)
-- Name: idx_animal_weights_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animal_weights_tenant ON public.animal_weights USING btree (tenant_id);


--
-- TOC entry 4711 (class 1259 OID 17780)
-- Name: idx_animals_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_category ON public.animals USING btree (category_id);


--
-- TOC entry 4712 (class 1259 OID 17781)
-- Name: idx_animals_dam; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_dam ON public.animals USING btree (dam_id);


--
-- TOC entry 4713 (class 1259 OID 17777)
-- Name: idx_animals_ear_tag; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_ear_tag ON public.animals USING btree (tenant_id, ear_tag);


--
-- TOC entry 4714 (class 1259 OID 18975)
-- Name: idx_animals_herd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_herd ON public.animals USING btree (herd_id);


--
-- TOC entry 4715 (class 1259 OID 17783)
-- Name: idx_animals_pasture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_pasture ON public.animals USING btree (current_pasture_id);


--
-- TOC entry 4716 (class 1259 OID 17782)
-- Name: idx_animals_sire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_sire ON public.animals USING btree (sire_id);


--
-- TOC entry 4717 (class 1259 OID 17778)
-- Name: idx_animals_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_status ON public.animals USING btree (tenant_id, status);


--
-- TOC entry 4718 (class 1259 OID 17776)
-- Name: idx_animals_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_tenant ON public.animals USING btree (tenant_id);


--
-- TOC entry 4719 (class 1259 OID 17779)
-- Name: idx_animals_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_animals_type ON public.animals USING btree (animal_type_id);


--
-- TOC entry 4984 (class 1259 OID 20252)
-- Name: idx_app_registry_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_app_registry_active ON public.app_registry USING btree (is_active) WHERE (is_active = true);


--
-- TOC entry 4985 (class 1259 OID 20251)
-- Name: idx_app_registry_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_app_registry_slug ON public.app_registry USING btree (slug);


--
-- TOC entry 4986 (class 1259 OID 20253)
-- Name: idx_app_registry_tier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_app_registry_tier ON public.app_registry USING btree (min_plan_tier);


--
-- TOC entry 5007 (class 1259 OID 20411)
-- Name: idx_asset_depr_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_depr_asset ON public.asset_depreciation_schedule USING btree (fixed_asset_id);


--
-- TOC entry 5008 (class 1259 OID 20414)
-- Name: idx_asset_depr_journal_entry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_depr_journal_entry ON public.asset_depreciation_schedule USING btree (journal_entry_id);


--
-- TOC entry 5009 (class 1259 OID 20412)
-- Name: idx_asset_depr_period_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_depr_period_date ON public.asset_depreciation_schedule USING btree (tenant_id, period_date);


--
-- TOC entry 5010 (class 1259 OID 20413)
-- Name: idx_asset_depr_posted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_depr_posted ON public.asset_depreciation_schedule USING btree (tenant_id, is_posted);


--
-- TOC entry 5011 (class 1259 OID 20410)
-- Name: idx_asset_depr_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_depr_tenant ON public.asset_depreciation_schedule USING btree (tenant_id);


--
-- TOC entry 4558 (class 1259 OID 16802)
-- Name: idx_audit_log_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_date ON public.audit_log USING btree (changed_at);


--
-- TOC entry 4559 (class 1259 OID 16801)
-- Name: idx_audit_log_record; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_record ON public.audit_log USING btree (record_id);


--
-- TOC entry 4560 (class 1259 OID 16800)
-- Name: idx_audit_log_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_table ON public.audit_log USING btree (table_name);


--
-- TOC entry 4561 (class 1259 OID 20479)
-- Name: idx_audit_log_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_tenant ON public.audit_log USING btree (tenant_id);


--
-- TOC entry 4562 (class 1259 OID 20481)
-- Name: idx_audit_log_tenant_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_tenant_date ON public.audit_log USING btree (tenant_id, changed_at);


--
-- TOC entry 4563 (class 1259 OID 20480)
-- Name: idx_audit_log_tenant_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_tenant_table ON public.audit_log USING btree (tenant_id, table_name);


--
-- TOC entry 4513 (class 1259 OID 17236)
-- Name: idx_bank_accounts_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bank_accounts_tenant ON public.bank_accounts USING btree (tenant_id);


--
-- TOC entry 4613 (class 1259 OID 17144)
-- Name: idx_blog_posts_author; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_author ON public.blog_posts USING btree (author_id);


--
-- TOC entry 4614 (class 1259 OID 17143)
-- Name: idx_blog_posts_published_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_published_at ON public.blog_posts USING btree (published_at DESC);


--
-- TOC entry 4615 (class 1259 OID 17142)
-- Name: idx_blog_posts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_status ON public.blog_posts USING btree (status);


--
-- TOC entry 4616 (class 1259 OID 17198)
-- Name: idx_blog_posts_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_tenant ON public.blog_posts USING btree (tenant_id);


--
-- TOC entry 4617 (class 1259 OID 18991)
-- Name: idx_blog_posts_tenant_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_tenant_slug ON public.blog_posts USING btree (tenant_id, slug);


--
-- TOC entry 4784 (class 1259 OID 18922)
-- Name: idx_buyers_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_buyers_tenant ON public.buyers USING btree (tenant_id);


--
-- TOC entry 4483 (class 1259 OID 17197)
-- Name: idx_categories_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_tenant ON public.categories USING btree (tenant_id);


--
-- TOC entry 4594 (class 1259 OID 20469)
-- Name: idx_classes_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_classes_tenant ON public.classes USING btree (tenant_id);


--
-- TOC entry 4595 (class 1259 OID 20470)
-- Name: idx_classes_tenant_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_classes_tenant_active ON public.classes USING btree (tenant_id, is_active);


--
-- TOC entry 4922 (class 1259 OID 19739)
-- Name: idx_custom_reports_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_reports_created_by ON public.custom_reports USING btree (created_by);


--
-- TOC entry 4923 (class 1259 OID 19740)
-- Name: idx_custom_reports_favorite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_reports_favorite ON public.custom_reports USING btree (tenant_id, is_favorite) WHERE (is_favorite = true);


--
-- TOC entry 4924 (class 1259 OID 19738)
-- Name: idx_custom_reports_record_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_reports_record_type ON public.custom_reports USING btree (record_type);


--
-- TOC entry 4925 (class 1259 OID 19737)
-- Name: idx_custom_reports_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_reports_tenant ON public.custom_reports USING btree (tenant_id);


--
-- TOC entry 4466 (class 1259 OID 20473)
-- Name: idx_delivery_zones_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_zones_tenant ON public.delivery_zones USING btree (tenant_id);


--
-- TOC entry 4467 (class 1259 OID 20474)
-- Name: idx_delivery_zones_tenant_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_zones_tenant_active ON public.delivery_zones USING btree (tenant_id, is_active);


--
-- TOC entry 4787 (class 1259 OID 18923)
-- Name: idx_event_series_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_series_tenant ON public.event_series USING btree (tenant_id);


--
-- TOC entry 4792 (class 1259 OID 18924)
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date);


--
-- TOC entry 4793 (class 1259 OID 18925)
-- Name: idx_events_menu; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_menu ON public.events USING btree (menu_id);


--
-- TOC entry 4794 (class 1259 OID 18926)
-- Name: idx_events_series; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_series ON public.events USING btree (series_id);


--
-- TOC entry 4795 (class 1259 OID 18927)
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- TOC entry 4796 (class 1259 OID 18928)
-- Name: idx_events_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_tenant ON public.events USING btree (tenant_id);


--
-- TOC entry 4797 (class 1259 OID 18929)
-- Name: idx_events_tenant_date_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_tenant_date_status ON public.events USING btree (tenant_id, event_date, status);


--
-- TOC entry 4574 (class 1259 OID 17229)
-- Name: idx_fiscal_periods_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fiscal_periods_tenant ON public.fiscal_periods USING btree (tenant_id);


--
-- TOC entry 4998 (class 1259 OID 20368)
-- Name: idx_fixed_assets_asset_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fixed_assets_asset_account ON public.fixed_assets USING btree (asset_account_id);


--
-- TOC entry 4999 (class 1259 OID 20367)
-- Name: idx_fixed_assets_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fixed_assets_category ON public.fixed_assets USING btree (tenant_id, category);


--
-- TOC entry 5000 (class 1259 OID 20369)
-- Name: idx_fixed_assets_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fixed_assets_class ON public.fixed_assets USING btree (class_id);


--
-- TOC entry 5001 (class 1259 OID 20366)
-- Name: idx_fixed_assets_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fixed_assets_status ON public.fixed_assets USING btree (tenant_id, status);


--
-- TOC entry 5002 (class 1259 OID 20365)
-- Name: idx_fixed_assets_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fixed_assets_tenant ON public.fixed_assets USING btree (tenant_id);


--
-- TOC entry 4979 (class 1259 OID 20193)
-- Name: idx_global_block_instances_page; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_global_block_instances_page ON public.global_block_instances USING btree (page_id);


--
-- TOC entry 4974 (class 1259 OID 20168)
-- Name: idx_global_blocks_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_global_blocks_tenant ON public.global_blocks USING btree (tenant_id);


--
-- TOC entry 4733 (class 1259 OID 17878)
-- Name: idx_grazing_events_pasture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grazing_events_pasture ON public.pasture_grazing_events USING btree (pasture_id);


--
-- TOC entry 4734 (class 1259 OID 17877)
-- Name: idx_grazing_events_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grazing_events_tenant ON public.pasture_grazing_events USING btree (tenant_id);


--
-- TOC entry 5014 (class 1259 OID 20632)
-- Name: idx_herd_event_types_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_herd_event_types_tenant ON public.herd_event_types USING btree (tenant_id);


--
-- TOC entry 5019 (class 1259 OID 20664)
-- Name: idx_herd_events_tenant_herd_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_herd_events_tenant_herd_date ON public.herd_events USING btree (tenant_id, herd_id, event_date);


--
-- TOC entry 5020 (class 1259 OID 20665)
-- Name: idx_herd_events_tenant_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_herd_events_tenant_type ON public.herd_events USING btree (tenant_id, event_type_id);


--
-- TOC entry 4768 (class 1259 OID 18964)
-- Name: idx_herds_flocks_pasture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_herds_flocks_pasture ON public.herds_flocks USING btree (current_pasture_id);


--
-- TOC entry 4769 (class 1259 OID 18132)
-- Name: idx_herds_flocks_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_herds_flocks_tenant ON public.herds_flocks USING btree (tenant_id);


--
-- TOC entry 4535 (class 1259 OID 16718)
-- Name: idx_inventory_logs_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_logs_date ON public.inventory_logs USING btree (created_at);


--
-- TOC entry 4536 (class 1259 OID 16717)
-- Name: idx_inventory_logs_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_logs_item ON public.inventory_logs USING btree (item_id);


--
-- TOC entry 4537 (class 1259 OID 20475)
-- Name: idx_inventory_logs_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_logs_tenant ON public.inventory_logs USING btree (tenant_id);


--
-- TOC entry 4538 (class 1259 OID 20476)
-- Name: idx_inventory_logs_tenant_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inventory_logs_tenant_date ON public.inventory_logs USING btree (tenant_id, created_at);


--
-- TOC entry 4490 (class 1259 OID 16546)
-- Name: idx_items_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_active ON public.items USING btree (is_active);


--
-- TOC entry 4491 (class 1259 OID 16544)
-- Name: idx_items_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_category ON public.items USING btree (category_id);


--
-- TOC entry 4492 (class 1259 OID 16543)
-- Name: idx_items_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_sku ON public.items USING btree (sku);


--
-- TOC entry 4493 (class 1259 OID 17118)
-- Name: idx_items_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_status ON public.items USING btree (status);


--
-- TOC entry 4494 (class 1259 OID 17120)
-- Name: idx_items_stripe_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_stripe_price ON public.items USING btree (stripe_price_id);


--
-- TOC entry 4495 (class 1259 OID 17119)
-- Name: idx_items_stripe_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_stripe_product ON public.items USING btree (stripe_product_id);


--
-- TOC entry 4496 (class 1259 OID 17196)
-- Name: idx_items_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_tenant ON public.items USING btree (tenant_id);


--
-- TOC entry 4497 (class 1259 OID 16545)
-- Name: idx_items_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_items_type ON public.items USING btree (item_type);


--
-- TOC entry 4575 (class 1259 OID 16967)
-- Name: idx_journal_entries_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_entries_date ON public.journal_entries USING btree (entry_date);


--
-- TOC entry 4576 (class 1259 OID 16969)
-- Name: idx_journal_entries_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_entries_number ON public.journal_entries USING btree (entry_number);


--
-- TOC entry 4577 (class 1259 OID 18965)
-- Name: idx_journal_entries_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_entries_source ON public.journal_entries USING btree (source, source_id);


--
-- TOC entry 4578 (class 1259 OID 16968)
-- Name: idx_journal_entries_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_entries_status ON public.journal_entries USING btree (status);


--
-- TOC entry 4579 (class 1259 OID 17222)
-- Name: idx_journal_entries_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_entries_tenant ON public.journal_entries USING btree (tenant_id);


--
-- TOC entry 4584 (class 1259 OID 20484)
-- Name: idx_journal_entry_lines_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_entry_lines_tenant ON public.journal_entry_lines USING btree (tenant_id);


--
-- TOC entry 4585 (class 1259 OID 16993)
-- Name: idx_journal_lines_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_lines_account ON public.journal_entry_lines USING btree (account_id);


--
-- TOC entry 4586 (class 1259 OID 17047)
-- Name: idx_journal_lines_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_lines_class ON public.journal_entry_lines USING btree (class_id);


--
-- TOC entry 4587 (class 1259 OID 16992)
-- Name: idx_journal_lines_entry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_journal_lines_entry ON public.journal_entry_lines USING btree (journal_entry_id);


--
-- TOC entry 4804 (class 1259 OID 18930)
-- Name: idx_media_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_created ON public.media USING btree (created_at DESC);


--
-- TOC entry 4805 (class 1259 OID 18931)
-- Name: idx_media_folder; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_folder ON public.media USING btree (tenant_id, folder);


--
-- TOC entry 4798 (class 1259 OID 18932)
-- Name: idx_media_folders_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_folders_parent ON public.media_folders USING btree (parent_id);


--
-- TOC entry 4799 (class 1259 OID 18933)
-- Name: idx_media_folders_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_folders_tenant ON public.media_folders USING btree (tenant_id);


--
-- TOC entry 4806 (class 1259 OID 18934)
-- Name: idx_media_mime; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_mime ON public.media USING btree (mime_type);


--
-- TOC entry 4807 (class 1259 OID 18935)
-- Name: idx_media_tags; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_tags ON public.media USING gin (tags);


--
-- TOC entry 4808 (class 1259 OID 18936)
-- Name: idx_media_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_media_tenant ON public.media USING btree (tenant_id);


--
-- TOC entry 4504 (class 1259 OID 16585)
-- Name: idx_memberships_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_memberships_account ON public.memberships USING btree (account_id);


--
-- TOC entry 4505 (class 1259 OID 16587)
-- Name: idx_memberships_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_memberships_dates ON public.memberships USING btree (start_date, end_date);


--
-- TOC entry 4506 (class 1259 OID 16586)
-- Name: idx_memberships_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_memberships_status ON public.memberships USING btree (status);


--
-- TOC entry 4507 (class 1259 OID 20477)
-- Name: idx_memberships_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_memberships_tenant ON public.memberships USING btree (tenant_id);


--
-- TOC entry 4508 (class 1259 OID 20478)
-- Name: idx_memberships_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_memberships_tenant_status ON public.memberships USING btree (tenant_id, status);


--
-- TOC entry 4680 (class 1259 OID 17591)
-- Name: idx_menu_item_modifications_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_item_modifications_item ON public.menu_item_modifications USING btree (tenant_id, menu_item_id);


--
-- TOC entry 4681 (class 1259 OID 17595)
-- Name: idx_menu_item_modifications_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_item_modifications_tenant ON public.menu_item_modifications USING btree (tenant_id);


--
-- TOC entry 4541 (class 1259 OID 18967)
-- Name: idx_menu_items_stripe_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_stripe_price ON public.menu_items USING btree (stripe_price_id) WHERE (stripe_price_id IS NOT NULL);


--
-- TOC entry 4542 (class 1259 OID 18968)
-- Name: idx_menu_items_stripe_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_stripe_product ON public.menu_items USING btree (stripe_product_id) WHERE (stripe_product_id IS NOT NULL);


--
-- TOC entry 4543 (class 1259 OID 17334)
-- Name: idx_menu_items_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant ON public.menu_items USING btree (tenant_id);


--
-- TOC entry 4639 (class 1259 OID 17416)
-- Name: idx_menu_section_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_section_items_order ON public.menu_section_items USING btree (section_id, sort_order);


--
-- TOC entry 4640 (class 1259 OID 17415)
-- Name: idx_menu_section_items_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_section_items_section ON public.menu_section_items USING btree (section_id);


--
-- TOC entry 4635 (class 1259 OID 17413)
-- Name: idx_menu_sections_menu; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_sections_menu ON public.menu_sections USING btree (menu_id);


--
-- TOC entry 4636 (class 1259 OID 17414)
-- Name: idx_menu_sections_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menu_sections_order ON public.menu_sections USING btree (menu_id, sort_order);


--
-- TOC entry 4627 (class 1259 OID 17412)
-- Name: idx_menus_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menus_featured ON public.menus USING btree (is_featured) WHERE (is_featured = true);


--
-- TOC entry 4628 (class 1259 OID 17410)
-- Name: idx_menus_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menus_slug ON public.menus USING btree (tenant_id, slug);


--
-- TOC entry 4629 (class 1259 OID 17411)
-- Name: idx_menus_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menus_status ON public.menus USING btree (status);


--
-- TOC entry 4630 (class 1259 OID 17409)
-- Name: idx_menus_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_menus_tenant ON public.menus USING btree (tenant_id);


--
-- TOC entry 4675 (class 1259 OID 17593)
-- Name: idx_modifications_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modifications_active ON public.modifications USING btree (tenant_id, is_active);


--
-- TOC entry 4676 (class 1259 OID 17592)
-- Name: idx_modifications_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modifications_category ON public.modifications USING btree (tenant_id, category);


--
-- TOC entry 4677 (class 1259 OID 17594)
-- Name: idx_modifications_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_modifications_tenant ON public.modifications USING btree (tenant_id);


--
-- TOC entry 4745 (class 1259 OID 17947)
-- Name: idx_nutrients_sample; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_nutrients_sample ON public.pasture_nutrients USING btree (soil_sample_id);


--
-- TOC entry 4531 (class 1259 OID 16697)
-- Name: idx_order_items_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_item ON public.order_items USING btree (item_id);


--
-- TOC entry 4532 (class 1259 OID 16696)
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- TOC entry 4522 (class 1259 OID 16670)
-- Name: idx_orders_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_account ON public.orders USING btree (account_id);


--
-- TOC entry 4523 (class 1259 OID 16672)
-- Name: idx_orders_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_date ON public.orders USING btree (ordered_at);


--
-- TOC entry 4524 (class 1259 OID 16669)
-- Name: idx_orders_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_number ON public.orders USING btree (order_number);


--
-- TOC entry 4525 (class 1259 OID 16671)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 4526 (class 1259 OID 17243)
-- Name: idx_orders_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_tenant ON public.orders USING btree (tenant_id);


--
-- TOC entry 4965 (class 1259 OID 20147)
-- Name: idx_page_blocks_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_blocks_order ON public.page_blocks USING btree (page_id, zone_key, display_order);


--
-- TOC entry 4966 (class 1259 OID 20145)
-- Name: idx_page_blocks_page; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_blocks_page ON public.page_blocks USING btree (page_id);


--
-- TOC entry 4967 (class 1259 OID 20146)
-- Name: idx_page_blocks_zone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_blocks_zone ON public.page_blocks USING btree (page_id, zone_key);


--
-- TOC entry 4819 (class 1259 OID 18937)
-- Name: idx_page_sections_page; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_page_sections_page ON public.page_sections USING btree (page_id);


--
-- TOC entry 4748 (class 1259 OID 17973)
-- Name: idx_pasture_tasks_completed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pasture_tasks_completed ON public.pasture_tasks USING btree (is_completed);


--
-- TOC entry 4749 (class 1259 OID 17972)
-- Name: idx_pasture_tasks_pasture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pasture_tasks_pasture ON public.pasture_tasks USING btree (pasture_id);


--
-- TOC entry 4750 (class 1259 OID 17971)
-- Name: idx_pasture_tasks_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pasture_tasks_tenant ON public.pasture_tasks USING btree (tenant_id);


--
-- TOC entry 4702 (class 1259 OID 17722)
-- Name: idx_pastures_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pastures_tenant ON public.pastures USING btree (tenant_id);


--
-- TOC entry 4606 (class 1259 OID 20200)
-- Name: idx_plaid_accounts_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plaid_accounts_tenant_id ON public.plaid_accounts USING btree (tenant_id);


--
-- TOC entry 4602 (class 1259 OID 18969)
-- Name: idx_plaid_items_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plaid_items_item_id ON public.plaid_items USING btree (item_id);


--
-- TOC entry 4603 (class 1259 OID 20194)
-- Name: idx_plaid_items_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_plaid_items_tenant_id ON public.plaid_items USING btree (tenant_id);


--
-- TOC entry 4887 (class 1259 OID 19114)
-- Name: idx_pos_layout_items_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_layout_items_item ON public.pos_layout_items USING btree (item_id);


--
-- TOC entry 4888 (class 1259 OID 19113)
-- Name: idx_pos_layout_items_layout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_layout_items_layout ON public.pos_layout_items USING btree (layout_id);


--
-- TOC entry 4889 (class 1259 OID 19115)
-- Name: idx_pos_layout_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_layout_items_order ON public.pos_layout_items USING btree (layout_id, display_order);


--
-- TOC entry 4880 (class 1259 OID 19112)
-- Name: idx_pos_layouts_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_layouts_default ON public.pos_layouts USING btree (tenant_id, is_default) WHERE (is_default = true);


--
-- TOC entry 4881 (class 1259 OID 19116)
-- Name: idx_pos_layouts_one_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_pos_layouts_one_default ON public.pos_layouts USING btree (tenant_id) WHERE (is_default = true);


--
-- TOC entry 4882 (class 1259 OID 19111)
-- Name: idx_pos_layouts_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_layouts_tenant ON public.pos_layouts USING btree (tenant_id);


--
-- TOC entry 4655 (class 1259 OID 17469)
-- Name: idx_pos_order_items_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_order_items_item ON public.pos_order_items USING btree (item_id) WHERE (item_id IS NOT NULL);


--
-- TOC entry 4656 (class 1259 OID 17468)
-- Name: idx_pos_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_order_items_order ON public.pos_order_items USING btree (order_id);


--
-- TOC entry 4645 (class 1259 OID 17464)
-- Name: idx_pos_orders_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_orders_date ON public.pos_orders USING btree (created_at);


--
-- TOC entry 4646 (class 1259 OID 17463)
-- Name: idx_pos_orders_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_orders_number ON public.pos_orders USING btree (order_number);


--
-- TOC entry 4647 (class 1259 OID 17466)
-- Name: idx_pos_orders_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_orders_payment ON public.pos_orders USING btree (payment_method);


--
-- TOC entry 4648 (class 1259 OID 17467)
-- Name: idx_pos_orders_payment_intent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_orders_payment_intent ON public.pos_orders USING btree (payment_intent_id) WHERE (payment_intent_id IS NOT NULL);


--
-- TOC entry 4649 (class 1259 OID 17465)
-- Name: idx_pos_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_orders_status ON public.pos_orders USING btree (status);


--
-- TOC entry 4650 (class 1259 OID 17462)
-- Name: idx_pos_orders_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pos_orders_tenant ON public.pos_orders USING btree (tenant_id);


--
-- TOC entry 4853 (class 1259 OID 18938)
-- Name: idx_processing_records_animal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_processing_records_animal ON public.processing_records USING btree (animal_id);


--
-- TOC entry 4854 (class 1259 OID 18939)
-- Name: idx_processing_records_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_processing_records_date ON public.processing_records USING btree (processing_date);


--
-- TOC entry 4855 (class 1259 OID 18940)
-- Name: idx_processing_records_herd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_processing_records_herd ON public.processing_records USING btree (herd_id);


--
-- TOC entry 4856 (class 1259 OID 18941)
-- Name: idx_processing_records_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_processing_records_status ON public.processing_records USING btree (status);


--
-- TOC entry 4857 (class 1259 OID 18942)
-- Name: idx_processing_records_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_processing_records_tenant ON public.processing_records USING btree (tenant_id);


--
-- TOC entry 4860 (class 1259 OID 18943)
-- Name: idx_rainfall_tenant_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rainfall_tenant_date ON public.rainfall_records USING btree (tenant_id, record_date);


--
-- TOC entry 4861 (class 1259 OID 18944)
-- Name: idx_rainfall_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rainfall_year ON public.rainfall_records USING btree (tenant_id, EXTRACT(year FROM record_date));


--
-- TOC entry 4596 (class 1259 OID 20482)
-- Name: idx_report_config_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_report_config_tenant ON public.report_configurations USING btree (tenant_id);


--
-- TOC entry 4597 (class 1259 OID 20483)
-- Name: idx_report_config_tenant_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_report_config_tenant_type ON public.report_configurations USING btree (tenant_id, report_type);


--
-- TOC entry 4669 (class 1259 OID 17551)
-- Name: idx_restaurant_order_items_menu_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_order_items_menu_item ON public.restaurant_order_items USING btree (menu_item_id);


--
-- TOC entry 4670 (class 1259 OID 17550)
-- Name: idx_restaurant_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_order_items_order ON public.restaurant_order_items USING btree (order_id);


--
-- TOC entry 4671 (class 1259 OID 18970)
-- Name: idx_restaurant_order_items_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_order_items_tenant ON public.restaurant_order_items USING btree (tenant_id);


--
-- TOC entry 4672 (class 1259 OID 18971)
-- Name: idx_restaurant_order_items_tenant_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_order_items_tenant_order ON public.restaurant_order_items USING btree (tenant_id, order_id);


--
-- TOC entry 4659 (class 1259 OID 17548)
-- Name: idx_restaurant_orders_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_orders_date ON public.restaurant_orders USING btree (created_at);


--
-- TOC entry 4660 (class 1259 OID 17549)
-- Name: idx_restaurant_orders_menu; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_orders_menu ON public.restaurant_orders USING btree (menu_id);


--
-- TOC entry 4661 (class 1259 OID 17545)
-- Name: idx_restaurant_orders_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_orders_number ON public.restaurant_orders USING btree (order_number);


--
-- TOC entry 4662 (class 1259 OID 17547)
-- Name: idx_restaurant_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_orders_status ON public.restaurant_orders USING btree (status);


--
-- TOC entry 4663 (class 1259 OID 17544)
-- Name: idx_restaurant_orders_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_orders_tenant ON public.restaurant_orders USING btree (tenant_id);


--
-- TOC entry 4664 (class 1259 OID 17546)
-- Name: idx_restaurant_orders_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_restaurant_orders_ticket ON public.restaurant_orders USING btree (ticket_number);


--
-- TOC entry 4873 (class 1259 OID 18945)
-- Name: idx_sale_ticket_fees_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_ticket_fees_ticket ON public.sale_ticket_fees USING btree (sale_ticket_id);


--
-- TOC entry 4869 (class 1259 OID 18946)
-- Name: idx_sale_ticket_items_animal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_ticket_items_animal ON public.sale_ticket_items USING btree (animal_id);


--
-- TOC entry 4870 (class 1259 OID 18947)
-- Name: idx_sale_ticket_items_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_ticket_items_ticket ON public.sale_ticket_items USING btree (sale_ticket_id);


--
-- TOC entry 4864 (class 1259 OID 18948)
-- Name: idx_sale_tickets_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_tickets_date ON public.sale_tickets USING btree (sale_date);


--
-- TOC entry 4865 (class 1259 OID 18949)
-- Name: idx_sale_tickets_sold_to; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_tickets_sold_to ON public.sale_tickets USING btree (sold_to);


--
-- TOC entry 4866 (class 1259 OID 18950)
-- Name: idx_sale_tickets_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sale_tickets_tenant ON public.sale_tickets USING btree (tenant_id);


--
-- TOC entry 4904 (class 1259 OID 19644)
-- Name: idx_site_assets_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_assets_category ON public.site_assets USING btree (category);


--
-- TOC entry 4905 (class 1259 OID 19643)
-- Name: idx_site_assets_folder; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_assets_folder ON public.site_assets USING btree (tenant_id, folder);


--
-- TOC entry 4906 (class 1259 OID 19645)
-- Name: idx_site_assets_tags; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_assets_tags ON public.site_assets USING gin (tags);


--
-- TOC entry 4907 (class 1259 OID 19642)
-- Name: idx_site_assets_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_assets_tenant ON public.site_assets USING btree (tenant_id);


--
-- TOC entry 4811 (class 1259 OID 19654)
-- Name: idx_site_pages_homepage; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_pages_homepage ON public.site_pages USING btree (tenant_id, is_homepage) WHERE (is_homepage = true);


--
-- TOC entry 4812 (class 1259 OID 18951)
-- Name: idx_site_pages_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_pages_slug ON public.site_pages USING btree (tenant_id, slug);


--
-- TOC entry 4813 (class 1259 OID 19653)
-- Name: idx_site_pages_template; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_pages_template ON public.site_pages USING btree (template_id) WHERE (template_id IS NOT NULL);


--
-- TOC entry 4814 (class 1259 OID 18952)
-- Name: idx_site_pages_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_site_pages_tenant ON public.site_pages USING btree (tenant_id);


--
-- TOC entry 4834 (class 1259 OID 18953)
-- Name: idx_social_connections_platform; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_connections_platform ON public.social_connections USING btree (platform_id);


--
-- TOC entry 4835 (class 1259 OID 18954)
-- Name: idx_social_connections_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_connections_status ON public.social_connections USING btree (status);


--
-- TOC entry 4836 (class 1259 OID 18955)
-- Name: idx_social_connections_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_connections_tenant ON public.social_connections USING btree (tenant_id);


--
-- TOC entry 4847 (class 1259 OID 18956)
-- Name: idx_social_post_platforms_connection; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_post_platforms_connection ON public.social_post_platforms USING btree (connection_id);


--
-- TOC entry 4848 (class 1259 OID 18957)
-- Name: idx_social_post_platforms_post; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_post_platforms_post ON public.social_post_platforms USING btree (social_post_id);


--
-- TOC entry 4841 (class 1259 OID 18958)
-- Name: idx_social_posts_blog; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_posts_blog ON public.social_posts USING btree (blog_post_id) WHERE (blog_post_id IS NOT NULL);


--
-- TOC entry 4842 (class 1259 OID 18959)
-- Name: idx_social_posts_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_posts_scheduled ON public.social_posts USING btree (scheduled_for) WHERE ((status)::text = 'scheduled'::text);


--
-- TOC entry 4843 (class 1259 OID 18960)
-- Name: idx_social_posts_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_posts_status ON public.social_posts USING btree (status);


--
-- TOC entry 4844 (class 1259 OID 18961)
-- Name: idx_social_posts_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_social_posts_tenant ON public.social_posts USING btree (tenant_id);


--
-- TOC entry 4741 (class 1259 OID 17927)
-- Name: idx_soil_samples_pasture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_soil_samples_pasture ON public.pasture_soil_samples USING btree (pasture_id);


--
-- TOC entry 4742 (class 1259 OID 17926)
-- Name: idx_soil_samples_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_soil_samples_tenant ON public.pasture_soil_samples USING btree (tenant_id);


--
-- TOC entry 4945 (class 1259 OID 19854)
-- Name: idx_stripe_app_fees_stripe_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stripe_app_fees_stripe_id ON public.stripe_application_fees USING btree (stripe_fee_id);


--
-- TOC entry 4946 (class 1259 OID 19853)
-- Name: idx_stripe_app_fees_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stripe_app_fees_tenant ON public.stripe_application_fees USING btree (tenant_id);


--
-- TOC entry 4939 (class 1259 OID 19834)
-- Name: idx_stripe_terminal_locations_stripe_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stripe_terminal_locations_stripe_id ON public.stripe_terminal_locations USING btree (stripe_location_id);


--
-- TOC entry 4940 (class 1259 OID 19833)
-- Name: idx_stripe_terminal_locations_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stripe_terminal_locations_tenant ON public.stripe_terminal_locations USING btree (tenant_id);


--
-- TOC entry 4933 (class 1259 OID 19812)
-- Name: idx_stripe_terminal_readers_stripe_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stripe_terminal_readers_stripe_id ON public.stripe_terminal_readers USING btree (stripe_reader_id);


--
-- TOC entry 4934 (class 1259 OID 19811)
-- Name: idx_stripe_terminal_readers_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stripe_terminal_readers_tenant ON public.stripe_terminal_readers USING btree (tenant_id);


--
-- TOC entry 4959 (class 1259 OID 19919)
-- Name: idx_subscription_events_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_events_tenant ON public.subscription_events USING btree (tenant_id);


--
-- TOC entry 4960 (class 1259 OID 19920)
-- Name: idx_subscription_events_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_events_type ON public.subscription_events USING btree (event_type);


--
-- TOC entry 4953 (class 1259 OID 19921)
-- Name: idx_subscription_plans_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_plans_active ON public.subscription_plans USING btree (is_active, sort_order);


--
-- TOC entry 4954 (class 1259 OID 19926)
-- Name: idx_subscription_plans_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_subscription_plans_slug ON public.subscription_plans USING btree (slug);


--
-- TOC entry 4898 (class 1259 OID 19617)
-- Name: idx_template_zones_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_template_zones_order ON public.template_zones USING btree (template_id, display_order);


--
-- TOC entry 4899 (class 1259 OID 19616)
-- Name: idx_template_zones_template; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_template_zones_template ON public.template_zones USING btree (template_id);


--
-- TOC entry 4987 (class 1259 OID 20255)
-- Name: idx_tenant_app_access_app; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenant_app_access_app ON public.tenant_app_access USING btree (app_id);


--
-- TOC entry 4988 (class 1259 OID 20256)
-- Name: idx_tenant_app_access_composite; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenant_app_access_composite ON public.tenant_app_access USING btree (tenant_id, app_id);


--
-- TOC entry 4989 (class 1259 OID 20254)
-- Name: idx_tenant_app_access_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenant_app_access_tenant ON public.tenant_app_access USING btree (tenant_id);


--
-- TOC entry 4928 (class 1259 OID 19781)
-- Name: idx_tenant_assets_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenant_assets_lookup ON public.tenant_assets USING btree (tenant_id, asset_type);


--
-- TOC entry 4618 (class 1259 OID 17194)
-- Name: idx_tenants_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_domain ON public.tenants USING btree (domain);


--
-- TOC entry 4619 (class 1259 OID 17193)
-- Name: idx_tenants_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_slug ON public.tenants USING btree (slug);


--
-- TOC entry 4620 (class 1259 OID 19790)
-- Name: idx_tenants_stripe_account_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_stripe_account_id ON public.tenants USING btree (stripe_account_id);


--
-- TOC entry 4621 (class 1259 OID 19923)
-- Name: idx_tenants_subscription_plan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_subscription_plan ON public.tenants USING btree (subscription_plan_id);


--
-- TOC entry 4622 (class 1259 OID 19922)
-- Name: idx_tenants_subscription_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_subscription_status ON public.tenants USING btree (subscription_status);


--
-- TOC entry 4824 (class 1259 OID 18962)
-- Name: idx_theme_sections_page_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_theme_sections_page_type ON public.theme_sections USING btree (theme_id, page_type);


--
-- TOC entry 4825 (class 1259 OID 18963)
-- Name: idx_theme_sections_theme; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_theme_sections_theme ON public.theme_sections USING btree (theme_id);


--
-- TOC entry 4548 (class 1259 OID 20471)
-- Name: idx_trailer_orders_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trailer_orders_tenant ON public.trailer_orders USING btree (tenant_id);


--
-- TOC entry 4549 (class 1259 OID 20472)
-- Name: idx_trailer_orders_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trailer_orders_tenant_status ON public.trailer_orders USING btree (tenant_id, status);


--
-- TOC entry 4514 (class 1259 OID 18972)
-- Name: idx_transactions_accepted_gl_account; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_accepted_gl_account ON public.transactions USING btree (accepted_gl_account_id);


--
-- TOC entry 4515 (class 1259 OID 17053)
-- Name: idx_transactions_class; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_class ON public.transactions USING btree (class_id);


--
-- TOC entry 4516 (class 1259 OID 16634)
-- Name: idx_transactions_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_date ON public.transactions USING btree (date);


--
-- TOC entry 4517 (class 1259 OID 17215)
-- Name: idx_transactions_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_tenant ON public.transactions USING btree (tenant_id);


--
-- TOC entry 4518 (class 1259 OID 16635)
-- Name: idx_transactions_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);


--
-- TOC entry 4519 (class 1259 OID 18054)
-- Name: idx_transactions_vendor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_vendor_id ON public.transactions USING btree (vendor_id);


--
-- TOC entry 4753 (class 1259 OID 17997)
-- Name: idx_treatments_pasture; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_treatments_pasture ON public.pasture_treatments USING btree (pasture_id);


--
-- TOC entry 4754 (class 1259 OID 17996)
-- Name: idx_treatments_tenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_treatments_tenant ON public.pasture_treatments USING btree (tenant_id);


--
-- TOC entry 4757 (class 1259 OID 18048)
-- Name: idx_vendors_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_is_active ON public.vendors USING btree (is_active);


--
-- TOC entry 4758 (class 1259 OID 18047)
-- Name: idx_vendors_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_name ON public.vendors USING btree (name);


--
-- TOC entry 4759 (class 1259 OID 18046)
-- Name: idx_vendors_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendors_tenant_id ON public.vendors USING btree (tenant_id);


--
-- TOC entry 5388 (class 2618 OID 16823)
-- Name: items_with_details _RETURN; Type: RULE; Schema: public; Owner: postgres
--

CREATE OR REPLACE VIEW public.items_with_details AS
 SELECT i.id,
    i.sku,
    i.name,
    i.description,
    i.item_type,
    i.category_id,
    i.price,
    i.member_price,
    i.cost,
    i.inventory_quantity,
    i.low_stock_threshold,
    i.is_taxable,
    i.tax_rate,
    i.shipping_zone,
    i.weight_oz,
    i.is_active,
    i.is_featured,
    i.sort_order,
    i.image_url,
    i.digital_file_url,
    i.created_at,
    i.updated_at,
    c.name AS category_name,
    c.slug AS category_slug,
        CASE
            WHEN (i.item_type <> 'inventory'::public.item_type) THEN 'digital'::text
            WHEN (i.inventory_quantity = 0) THEN 'out'::text
            WHEN (i.inventory_quantity <= i.low_stock_threshold) THEN 'low'::text
            ELSE 'in'::text
        END AS stock_status,
    COALESCE(i.member_price, (i.price * 0.9)) AS calculated_member_price,
    array_agg(DISTINCT t.name) FILTER (WHERE (t.name IS NOT NULL)) AS tag_names
   FROM (((public.items i
     LEFT JOIN public.categories c ON ((i.category_id = c.id)))
     LEFT JOIN public.item_tags it ON ((i.id = it.item_id)))
     LEFT JOIN public.tags t ON ((it.tag_id = t.id)))
  GROUP BY i.id, c.name, c.slug;


--
-- TOC entry 5222 (class 2620 OID 16819)
-- Name: order_items inventory_update_on_order_item; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER inventory_update_on_order_item AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_order();


--
-- TOC entry 5226 (class 2620 OID 16996)
-- Name: journal_entries set_journal_entry_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_journal_entry_number BEFORE INSERT ON public.journal_entries FOR EACH ROW WHEN ((new.entry_number IS NULL)) EXECUTE FUNCTION public.generate_journal_entry_number();


--
-- TOC entry 5220 (class 2620 OID 16814)
-- Name: orders set_order_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW WHEN ((new.order_number IS NULL)) EXECUTE FUNCTION public.generate_order_number();


--
-- TOC entry 5224 (class 2620 OID 16817)
-- Name: trailer_orders set_trailer_order_number; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_trailer_order_number BEFORE INSERT ON public.trailer_orders FOR EACH ROW WHEN ((new.order_number IS NULL)) EXECUTE FUNCTION public.generate_trailer_order_number();


--
-- TOC entry 5240 (class 2620 OID 19646)
-- Name: site_assets site_assets_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER site_assets_updated BEFORE UPDATE ON public.site_assets FOR EACH ROW EXECUTE FUNCTION public.update_site_designer_timestamp();


--
-- TOC entry 5239 (class 2620 OID 19655)
-- Name: site_pages site_pages_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER site_pages_updated BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.update_site_designer_timestamp();


--
-- TOC entry 5242 (class 2620 OID 20422)
-- Name: asset_depreciation_schedule trg_asset_depr_schedule_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_asset_depr_schedule_updated_at BEFORE UPDATE ON public.asset_depreciation_schedule FOR EACH ROW EXECUTE FUNCTION public.update_fixed_asset_timestamp();


--
-- TOC entry 5241 (class 2620 OID 20421)
-- Name: fixed_assets trg_fixed_assets_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_fixed_assets_updated_at BEFORE UPDATE ON public.fixed_assets FOR EACH ROW EXECUTE FUNCTION public.update_fixed_asset_timestamp();


--
-- TOC entry 5225 (class 2620 OID 17001)
-- Name: accounts_chart update_accounts_chart_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_accounts_chart_updated_at BEFORE UPDATE ON public.accounts_chart FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5215 (class 2620 OID 16804)
-- Name: accounts update_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5234 (class 2620 OID 18015)
-- Name: animal_sales update_animal_sales_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_animal_sales_updated_at BEFORE UPDATE ON public.animal_sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5233 (class 2620 OID 18013)
-- Name: animals update_animals_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5227 (class 2620 OID 17000)
-- Name: journal_entries update_balances_on_post; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_balances_on_post AFTER UPDATE OF status ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_account_balances();


--
-- TOC entry 5216 (class 2620 OID 16810)
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5230 (class 2620 OID 17054)
-- Name: classes update_classes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5214 (class 2620 OID 16809)
-- Name: delivery_zones update_delivery_zones_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON public.delivery_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5235 (class 2620 OID 18016)
-- Name: pasture_grazing_events update_grazing_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_grazing_events_updated_at BEFORE UPDATE ON public.pasture_grazing_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5217 (class 2620 OID 16805)
-- Name: items update_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5228 (class 2620 OID 17002)
-- Name: journal_entries update_journal_entries_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5229 (class 2620 OID 16998)
-- Name: journal_entry_lines update_journal_totals_on_line_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_journal_totals_on_line_change AFTER INSERT OR DELETE OR UPDATE ON public.journal_entry_lines FOR EACH ROW EXECUTE FUNCTION public.update_journal_totals();


--
-- TOC entry 5218 (class 2620 OID 16808)
-- Name: memberships update_memberships_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5223 (class 2620 OID 16811)
-- Name: menu_items update_menu_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5231 (class 2620 OID 17597)
-- Name: modifications update_modifications_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_modifications_updated_at BEFORE UPDATE ON public.modifications FOR EACH ROW EXECUTE FUNCTION public.update_modifications_timestamp();


--
-- TOC entry 5221 (class 2620 OID 16806)
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5237 (class 2620 OID 18017)
-- Name: pasture_tasks update_pasture_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_pasture_tasks_updated_at BEFORE UPDATE ON public.pasture_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5238 (class 2620 OID 18018)
-- Name: pasture_treatments update_pasture_treatments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_pasture_treatments_updated_at BEFORE UPDATE ON public.pasture_treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5232 (class 2620 OID 18014)
-- Name: pastures update_pastures_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_pastures_updated_at BEFORE UPDATE ON public.pastures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5236 (class 2620 OID 18019)
-- Name: pasture_soil_samples update_soil_samples_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_soil_samples_updated_at BEFORE UPDATE ON public.pasture_soil_samples FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5219 (class 2620 OID 16807)
-- Name: transactions update_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5058 (class 2606 OID 16909)
-- Name: accounts_chart accounts_chart_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts_chart
    ADD CONSTRAINT accounts_chart_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.accounts_chart(id) ON DELETE SET NULL;


--
-- TOC entry 5059 (class 2606 OID 17203)
-- Name: accounts_chart accounts_chart_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts_chart
    ADD CONSTRAINT accounts_chart_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5022 (class 2606 OID 16479)
-- Name: accounts accounts_delivery_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_delivery_zone_id_fkey FOREIGN KEY (delivery_zone_id) REFERENCES public.delivery_zones(id) ON DELETE SET NULL;


--
-- TOC entry 5023 (class 2606 OID 17164)
-- Name: accounts accounts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5101 (class 2606 OID 17678)
-- Name: animal_categories animal_categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_categories
    ADD CONSTRAINT animal_categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5117 (class 2606 OID 17848)
-- Name: animal_health_records animal_health_records_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_health_records
    ADD CONSTRAINT animal_health_records_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- TOC entry 5118 (class 2606 OID 17843)
-- Name: animal_health_records animal_health_records_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_health_records
    ADD CONSTRAINT animal_health_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5102 (class 2606 OID 17697)
-- Name: animal_owners animal_owners_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_owners
    ADD CONSTRAINT animal_owners_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5113 (class 2606 OID 17801)
-- Name: animal_sales animal_sales_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_sales
    ADD CONSTRAINT animal_sales_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 17796)
-- Name: animal_sales animal_sales_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_sales
    ADD CONSTRAINT animal_sales_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5099 (class 2606 OID 17641)
-- Name: animal_types animal_types_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_types
    ADD CONSTRAINT animal_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5115 (class 2606 OID 17825)
-- Name: animal_weights animal_weights_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_weights
    ADD CONSTRAINT animal_weights_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- TOC entry 5116 (class 2606 OID 17820)
-- Name: animal_weights animal_weights_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animal_weights
    ADD CONSTRAINT animal_weights_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5104 (class 2606 OID 17741)
-- Name: animals animals_animal_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_animal_type_id_fkey FOREIGN KEY (animal_type_id) REFERENCES public.animal_types(id);


--
-- TOC entry 5105 (class 2606 OID 17751)
-- Name: animals animals_breed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.breeds(id);


--
-- TOC entry 5106 (class 2606 OID 17746)
-- Name: animals animals_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.animal_categories(id);


--
-- TOC entry 5107 (class 2606 OID 17771)
-- Name: animals animals_current_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_current_pasture_id_fkey FOREIGN KEY (current_pasture_id) REFERENCES public.pastures(id) ON DELETE SET NULL;


--
-- TOC entry 5108 (class 2606 OID 17756)
-- Name: animals animals_dam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_dam_id_fkey FOREIGN KEY (dam_id) REFERENCES public.animals(id) ON DELETE SET NULL;


--
-- TOC entry 5109 (class 2606 OID 18887)
-- Name: animals animals_herd_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_herd_id_fkey FOREIGN KEY (herd_id) REFERENCES public.herds_flocks(id) ON DELETE SET NULL;


--
-- TOC entry 5110 (class 2606 OID 17766)
-- Name: animals animals_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.animal_owners(id);


--
-- TOC entry 5111 (class 2606 OID 17761)
-- Name: animals animals_sire_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_sire_id_fkey FOREIGN KEY (sire_id) REFERENCES public.animals(id) ON DELETE SET NULL;


--
-- TOC entry 5112 (class 2606 OID 17736)
-- Name: animals animals_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5204 (class 2606 OID 20395)
-- Name: asset_depreciation_schedule asset_depr_fiscal_period_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_fiscal_period_fk FOREIGN KEY (fiscal_period_id) REFERENCES public.fiscal_periods(id) ON DELETE SET NULL;


--
-- TOC entry 5205 (class 2606 OID 20385)
-- Name: asset_depreciation_schedule asset_depr_fixed_asset_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_fixed_asset_fk FOREIGN KEY (fixed_asset_id) REFERENCES public.fixed_assets(id) ON DELETE CASCADE;


--
-- TOC entry 5206 (class 2606 OID 20400)
-- Name: asset_depreciation_schedule asset_depr_journal_entry_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_journal_entry_fk FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE SET NULL;


--
-- TOC entry 5207 (class 2606 OID 20405)
-- Name: asset_depreciation_schedule asset_depr_posted_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_posted_by_fk FOREIGN KEY (posted_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5208 (class 2606 OID 20390)
-- Name: asset_depreciation_schedule asset_depr_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_depreciation_schedule
    ADD CONSTRAINT asset_depr_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5056 (class 2606 OID 16795)
-- Name: audit_log audit_log_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5057 (class 2606 OID 20448)
-- Name: audit_log audit_log_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5033 (class 2606 OID 17231)
-- Name: bank_accounts bank_accounts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5077 (class 2606 OID 17136)
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5078 (class 2606 OID 17188)
-- Name: blog_posts blog_posts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5100 (class 2606 OID 17660)
-- Name: breeds breeds_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5136 (class 2606 OID 18732)
-- Name: buyers buyers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5024 (class 2606 OID 17176)
-- Name: categories categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5071 (class 2606 OID 20423)
-- Name: classes classes_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5177 (class 2606 OID 19732)
-- Name: custom_reports custom_reports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_reports
    ADD CONSTRAINT custom_reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 5178 (class 2606 OID 19727)
-- Name: custom_reports custom_reports_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_reports
    ADD CONSTRAINT custom_reports_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5021 (class 2606 OID 20433)
-- Name: delivery_zones delivery_zones_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5137 (class 2606 OID 18737)
-- Name: event_series event_series_default_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_series
    ADD CONSTRAINT event_series_default_menu_id_fkey FOREIGN KEY (default_menu_id) REFERENCES public.menus(id);


--
-- TOC entry 5138 (class 2606 OID 18742)
-- Name: event_series event_series_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_series
    ADD CONSTRAINT event_series_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5139 (class 2606 OID 18747)
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 5140 (class 2606 OID 18752)
-- Name: events events_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id);


--
-- TOC entry 5141 (class 2606 OID 18757)
-- Name: events events_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.event_series(id);


--
-- TOC entry 5142 (class 2606 OID 18762)
-- Name: events events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5060 (class 2606 OID 16926)
-- Name: fiscal_periods fiscal_periods_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5061 (class 2606 OID 17224)
-- Name: fiscal_periods fiscal_periods_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5195 (class 2606 OID 20335)
-- Name: fixed_assets fixed_assets_accum_depr_account_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_accum_depr_account_fk FOREIGN KEY (accumulated_depreciation_account_id) REFERENCES public.accounts_chart(id) ON DELETE RESTRICT;


--
-- TOC entry 5196 (class 2606 OID 20360)
-- Name: fixed_assets fixed_assets_acquisition_je_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_acquisition_je_fk FOREIGN KEY (acquisition_journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE SET NULL;


--
-- TOC entry 5197 (class 2606 OID 20330)
-- Name: fixed_assets fixed_assets_asset_account_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_asset_account_fk FOREIGN KEY (asset_account_id) REFERENCES public.accounts_chart(id) ON DELETE RESTRICT;


--
-- TOC entry 5198 (class 2606 OID 20345)
-- Name: fixed_assets fixed_assets_class_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_class_fk FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- TOC entry 5199 (class 2606 OID 20350)
-- Name: fixed_assets fixed_assets_created_by_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_created_by_fk FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5200 (class 2606 OID 20340)
-- Name: fixed_assets fixed_assets_depr_expense_account_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_depr_expense_account_fk FOREIGN KEY (depreciation_expense_account_id) REFERENCES public.accounts_chart(id) ON DELETE RESTRICT;


--
-- TOC entry 5201 (class 2606 OID 20355)
-- Name: fixed_assets fixed_assets_disposal_je_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_disposal_je_fk FOREIGN KEY (disposal_journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE SET NULL;


--
-- TOC entry 5202 (class 2606 OID 20320)
-- Name: fixed_assets fixed_assets_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5203 (class 2606 OID 20325)
-- Name: fixed_assets fixed_assets_vendor_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_assets
    ADD CONSTRAINT fixed_assets_vendor_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;


--
-- TOC entry 5074 (class 2606 OID 20195)
-- Name: plaid_items fk_plaid_items_tenant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plaid_items
    ADD CONSTRAINT fk_plaid_items_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5191 (class 2606 OID 20183)
-- Name: global_block_instances global_block_instances_global_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_block_instances
    ADD CONSTRAINT global_block_instances_global_block_id_fkey FOREIGN KEY (global_block_id) REFERENCES public.global_blocks(id) ON DELETE CASCADE;


--
-- TOC entry 5192 (class 2606 OID 20188)
-- Name: global_block_instances global_block_instances_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_block_instances
    ADD CONSTRAINT global_block_instances_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;


--
-- TOC entry 5190 (class 2606 OID 20163)
-- Name: global_blocks global_blocks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.global_blocks
    ADD CONSTRAINT global_blocks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5121 (class 2606 OID 17899)
-- Name: grazing_event_animals grazing_event_animals_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- TOC entry 5122 (class 2606 OID 17894)
-- Name: grazing_event_animals grazing_event_animals_grazing_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_grazing_event_id_fkey FOREIGN KEY (grazing_event_id) REFERENCES public.pasture_grazing_events(id) ON DELETE CASCADE;


--
-- TOC entry 5123 (class 2606 OID 17889)
-- Name: grazing_event_animals grazing_event_animals_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5209 (class 2606 OID 20627)
-- Name: herd_event_types herd_event_types_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_event_types
    ADD CONSTRAINT herd_event_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5210 (class 2606 OID 20654)
-- Name: herd_events herd_events_event_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_events
    ADD CONSTRAINT herd_events_event_type_id_fkey FOREIGN KEY (event_type_id) REFERENCES public.herd_event_types(id) ON DELETE RESTRICT;


--
-- TOC entry 5211 (class 2606 OID 20649)
-- Name: herd_events herd_events_herd_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_events
    ADD CONSTRAINT herd_events_herd_id_fkey FOREIGN KEY (herd_id) REFERENCES public.herds_flocks(id) ON DELETE CASCADE;


--
-- TOC entry 5212 (class 2606 OID 20659)
-- Name: herd_events herd_events_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_events
    ADD CONSTRAINT herd_events_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5213 (class 2606 OID 20644)
-- Name: herd_events herd_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herd_events
    ADD CONSTRAINT herd_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5134 (class 2606 OID 18892)
-- Name: herds_flocks herds_flocks_current_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herds_flocks
    ADD CONSTRAINT herds_flocks_current_pasture_id_fkey FOREIGN KEY (current_pasture_id) REFERENCES public.pastures(id) ON DELETE SET NULL;


--
-- TOC entry 5135 (class 2606 OID 18127)
-- Name: herds_flocks herds_flocks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.herds_flocks
    ADD CONSTRAINT herds_flocks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5046 (class 2606 OID 16712)
-- Name: inventory_logs inventory_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5047 (class 2606 OID 16707)
-- Name: inventory_logs inventory_logs_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- TOC entry 5048 (class 2606 OID 20438)
-- Name: inventory_logs inventory_logs_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5028 (class 2606 OID 16552)
-- Name: item_tags item_tags_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- TOC entry 5029 (class 2606 OID 16557)
-- Name: item_tags item_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 5026 (class 2606 OID 16538)
-- Name: items items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 5027 (class 2606 OID 17170)
-- Name: items items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5062 (class 2606 OID 16962)
-- Name: journal_entries journal_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5063 (class 2606 OID 16947)
-- Name: journal_entries journal_entries_fiscal_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_fiscal_period_id_fkey FOREIGN KEY (fiscal_period_id) REFERENCES public.fiscal_periods(id) ON DELETE RESTRICT;


--
-- TOC entry 5064 (class 2606 OID 16952)
-- Name: journal_entries journal_entries_posted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5065 (class 2606 OID 17217)
-- Name: journal_entries journal_entries_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5066 (class 2606 OID 16957)
-- Name: journal_entries journal_entries_voided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_voided_by_fkey FOREIGN KEY (voided_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5067 (class 2606 OID 16987)
-- Name: journal_entry_lines journal_entry_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts_chart(id) ON DELETE RESTRICT;


--
-- TOC entry 5068 (class 2606 OID 17042)
-- Name: journal_entry_lines journal_entry_lines_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- TOC entry 5069 (class 2606 OID 16982)
-- Name: journal_entry_lines journal_entry_lines_journal_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- TOC entry 5070 (class 2606 OID 20458)
-- Name: journal_entry_lines journal_entry_lines_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5143 (class 2606 OID 18782)
-- Name: media_folders media_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media_folders(id);


--
-- TOC entry 5144 (class 2606 OID 18787)
-- Name: media_folders media_folders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5145 (class 2606 OID 18767)
-- Name: media media_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media(id);


--
-- TOC entry 5146 (class 2606 OID 18772)
-- Name: media media_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5147 (class 2606 OID 18777)
-- Name: media media_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.accounts(id);


--
-- TOC entry 5030 (class 2606 OID 16575)
-- Name: memberships memberships_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- TOC entry 5031 (class 2606 OID 16580)
-- Name: memberships memberships_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- TOC entry 5032 (class 2606 OID 20443)
-- Name: memberships memberships_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5051 (class 2606 OID 16743)
-- Name: menu_item_ingredients menu_item_ingredients_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_ingredients
    ADD CONSTRAINT menu_item_ingredients_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- TOC entry 5052 (class 2606 OID 16738)
-- Name: menu_item_ingredients menu_item_ingredients_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_ingredients
    ADD CONSTRAINT menu_item_ingredients_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 17581)
-- Name: menu_item_modifications menu_item_modifications_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifications
    ADD CONSTRAINT menu_item_modifications_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 5098 (class 2606 OID 17586)
-- Name: menu_item_modifications menu_item_modifications_modification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifications
    ADD CONSTRAINT menu_item_modifications_modification_id_fkey FOREIGN KEY (modification_id) REFERENCES public.modifications(id) ON DELETE CASCADE;


--
-- TOC entry 5049 (class 2606 OID 18897)
-- Name: menu_items menu_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- TOC entry 5050 (class 2606 OID 17329)
-- Name: menu_items menu_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5084 (class 2606 OID 17404)
-- Name: menu_section_items menu_section_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_section_items
    ADD CONSTRAINT menu_section_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 5085 (class 2606 OID 17399)
-- Name: menu_section_items menu_section_items_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_section_items
    ADD CONSTRAINT menu_section_items_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.menu_sections(id) ON DELETE CASCADE;


--
-- TOC entry 5083 (class 2606 OID 17381)
-- Name: menu_sections menu_sections_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- TOC entry 5080 (class 2606 OID 17363)
-- Name: menus menus_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 5081 (class 2606 OID 17358)
-- Name: menus menus_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menus(id);


--
-- TOC entry 5082 (class 2606 OID 17353)
-- Name: menus menus_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5044 (class 2606 OID 16691)
-- Name: order_items order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- TOC entry 5045 (class 2606 OID 16686)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5041 (class 2606 OID 16659)
-- Name: orders orders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5042 (class 2606 OID 16664)
-- Name: orders orders_delivery_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_delivery_zone_id_fkey FOREIGN KEY (delivery_zone_id) REFERENCES public.delivery_zones(id) ON DELETE SET NULL;


--
-- TOC entry 5043 (class 2606 OID 17238)
-- Name: orders orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5188 (class 2606 OID 20135)
-- Name: page_blocks page_blocks_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_blocks
    ADD CONSTRAINT page_blocks_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;


--
-- TOC entry 5189 (class 2606 OID 20140)
-- Name: page_blocks page_blocks_parent_block_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_blocks
    ADD CONSTRAINT page_blocks_parent_block_id_fkey FOREIGN KEY (parent_block_id) REFERENCES public.page_blocks(id) ON DELETE CASCADE;


--
-- TOC entry 5149 (class 2606 OID 18792)
-- Name: page_sections page_sections_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 17872)
-- Name: pasture_grazing_events pasture_grazing_events_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_grazing_events
    ADD CONSTRAINT pasture_grazing_events_pasture_id_fkey FOREIGN KEY (pasture_id) REFERENCES public.pastures(id) ON DELETE CASCADE;


--
-- TOC entry 5120 (class 2606 OID 17867)
-- Name: pasture_grazing_events pasture_grazing_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_grazing_events
    ADD CONSTRAINT pasture_grazing_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5126 (class 2606 OID 17942)
-- Name: pasture_nutrients pasture_nutrients_soil_sample_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_nutrients
    ADD CONSTRAINT pasture_nutrients_soil_sample_id_fkey FOREIGN KEY (soil_sample_id) REFERENCES public.pasture_soil_samples(id) ON DELETE CASCADE;


--
-- TOC entry 5127 (class 2606 OID 17937)
-- Name: pasture_nutrients pasture_nutrients_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_nutrients
    ADD CONSTRAINT pasture_nutrients_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5124 (class 2606 OID 17921)
-- Name: pasture_soil_samples pasture_soil_samples_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_soil_samples
    ADD CONSTRAINT pasture_soil_samples_pasture_id_fkey FOREIGN KEY (pasture_id) REFERENCES public.pastures(id) ON DELETE CASCADE;


--
-- TOC entry 5125 (class 2606 OID 17916)
-- Name: pasture_soil_samples pasture_soil_samples_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_soil_samples
    ADD CONSTRAINT pasture_soil_samples_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5128 (class 2606 OID 17966)
-- Name: pasture_tasks pasture_tasks_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_tasks
    ADD CONSTRAINT pasture_tasks_pasture_id_fkey FOREIGN KEY (pasture_id) REFERENCES public.pastures(id) ON DELETE CASCADE;


--
-- TOC entry 5129 (class 2606 OID 17961)
-- Name: pasture_tasks pasture_tasks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_tasks
    ADD CONSTRAINT pasture_tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5130 (class 2606 OID 17991)
-- Name: pasture_treatments pasture_treatments_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_treatments
    ADD CONSTRAINT pasture_treatments_pasture_id_fkey FOREIGN KEY (pasture_id) REFERENCES public.pastures(id) ON DELETE CASCADE;


--
-- TOC entry 5131 (class 2606 OID 17986)
-- Name: pasture_treatments pasture_treatments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasture_treatments
    ADD CONSTRAINT pasture_treatments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5103 (class 2606 OID 17717)
-- Name: pastures pastures_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pastures
    ADD CONSTRAINT pastures_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5075 (class 2606 OID 18902)
-- Name: plaid_accounts plaid_accounts_linked_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plaid_accounts
    ADD CONSTRAINT plaid_accounts_linked_account_id_fkey FOREIGN KEY (linked_account_id) REFERENCES public.accounts_chart(id);


--
-- TOC entry 5076 (class 2606 OID 17105)
-- Name: plaid_accounts plaid_accounts_plaid_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plaid_accounts
    ADD CONSTRAINT plaid_accounts_plaid_item_id_fkey FOREIGN KEY (plaid_item_id) REFERENCES public.plaid_items(id);


--
-- TOC entry 5171 (class 2606 OID 19106)
-- Name: pos_layout_items pos_layout_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layout_items
    ADD CONSTRAINT pos_layout_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- TOC entry 5172 (class 2606 OID 19101)
-- Name: pos_layout_items pos_layout_items_layout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layout_items
    ADD CONSTRAINT pos_layout_items_layout_id_fkey FOREIGN KEY (layout_id) REFERENCES public.pos_layouts(id) ON DELETE CASCADE;


--
-- TOC entry 5168 (class 2606 OID 19081)
-- Name: pos_layouts pos_layouts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layouts
    ADD CONSTRAINT pos_layouts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 5169 (class 2606 OID 19076)
-- Name: pos_layouts pos_layouts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layouts
    ADD CONSTRAINT pos_layouts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5170 (class 2606 OID 19086)
-- Name: pos_layouts pos_layouts_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_layouts
    ADD CONSTRAINT pos_layouts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.accounts(id);


--
-- TOC entry 5088 (class 2606 OID 17457)
-- Name: pos_order_items pos_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- TOC entry 5089 (class 2606 OID 17452)
-- Name: pos_order_items pos_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.pos_orders(id) ON DELETE CASCADE;


--
-- TOC entry 5086 (class 2606 OID 17439)
-- Name: pos_orders pos_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 5087 (class 2606 OID 17434)
-- Name: pos_orders pos_orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5157 (class 2606 OID 18797)
-- Name: processing_records processing_records_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processing_records
    ADD CONSTRAINT processing_records_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE SET NULL;


--
-- TOC entry 5158 (class 2606 OID 18802)
-- Name: processing_records processing_records_herd_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processing_records
    ADD CONSTRAINT processing_records_herd_id_fkey FOREIGN KEY (herd_id) REFERENCES public.herds_flocks(id) ON DELETE SET NULL;


--
-- TOC entry 5159 (class 2606 OID 18807)
-- Name: processing_records processing_records_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processing_records
    ADD CONSTRAINT processing_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5160 (class 2606 OID 18812)
-- Name: rainfall_records rainfall_records_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rainfall_records
    ADD CONSTRAINT rainfall_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5072 (class 2606 OID 17070)
-- Name: report_configurations report_configurations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_configurations
    ADD CONSTRAINT report_configurations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5073 (class 2606 OID 20453)
-- Name: report_configurations report_configurations_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_configurations
    ADD CONSTRAINT report_configurations_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5176 (class 2606 OID 19696)
-- Name: report_field_definitions report_field_definitions_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_field_definitions
    ADD CONSTRAINT report_field_definitions_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.report_record_definitions(id) ON DELETE CASCADE;


--
-- TOC entry 5179 (class 2606 OID 19753)
-- Name: report_run_history report_run_history_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_run_history
    ADD CONSTRAINT report_run_history_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.custom_reports(id) ON DELETE SET NULL;


--
-- TOC entry 5180 (class 2606 OID 19758)
-- Name: report_run_history report_run_history_run_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_run_history
    ADD CONSTRAINT report_run_history_run_by_fkey FOREIGN KEY (run_by) REFERENCES public.accounts(id);


--
-- TOC entry 5181 (class 2606 OID 19748)
-- Name: report_run_history report_run_history_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.report_run_history
    ADD CONSTRAINT report_run_history_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5094 (class 2606 OID 17539)
-- Name: restaurant_order_items restaurant_order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_order_items
    ADD CONSTRAINT restaurant_order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id);


--
-- TOC entry 5095 (class 2606 OID 17534)
-- Name: restaurant_order_items restaurant_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_order_items
    ADD CONSTRAINT restaurant_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.restaurant_orders(id) ON DELETE CASCADE;


--
-- TOC entry 5096 (class 2606 OID 18907)
-- Name: restaurant_order_items restaurant_order_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_order_items
    ADD CONSTRAINT restaurant_order_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5090 (class 2606 OID 17517)
-- Name: restaurant_orders restaurant_orders_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.accounts(id);


--
-- TOC entry 5091 (class 2606 OID 17512)
-- Name: restaurant_orders restaurant_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 5092 (class 2606 OID 17507)
-- Name: restaurant_orders restaurant_orders_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id);


--
-- TOC entry 5093 (class 2606 OID 17502)
-- Name: restaurant_orders restaurant_orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5167 (class 2606 OID 18817)
-- Name: sale_fee_types sale_fee_types_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_fee_types
    ADD CONSTRAINT sale_fee_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5165 (class 2606 OID 18822)
-- Name: sale_ticket_fees sale_ticket_fees_sale_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_fees
    ADD CONSTRAINT sale_ticket_fees_sale_ticket_id_fkey FOREIGN KEY (sale_ticket_id) REFERENCES public.sale_tickets(id) ON DELETE CASCADE;


--
-- TOC entry 5166 (class 2606 OID 18827)
-- Name: sale_ticket_fees sale_ticket_fees_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_fees
    ADD CONSTRAINT sale_ticket_fees_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5162 (class 2606 OID 18832)
-- Name: sale_ticket_items sale_ticket_items_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_items
    ADD CONSTRAINT sale_ticket_items_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE SET NULL;


--
-- TOC entry 5163 (class 2606 OID 18837)
-- Name: sale_ticket_items sale_ticket_items_sale_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_items
    ADD CONSTRAINT sale_ticket_items_sale_ticket_id_fkey FOREIGN KEY (sale_ticket_id) REFERENCES public.sale_tickets(id) ON DELETE CASCADE;


--
-- TOC entry 5164 (class 2606 OID 18842)
-- Name: sale_ticket_items sale_ticket_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_ticket_items
    ADD CONSTRAINT sale_ticket_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5161 (class 2606 OID 18847)
-- Name: sale_tickets sale_tickets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_tickets
    ADD CONSTRAINT sale_tickets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5174 (class 2606 OID 19632)
-- Name: site_assets site_assets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_assets
    ADD CONSTRAINT site_assets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5175 (class 2606 OID 19637)
-- Name: site_assets site_assets_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_assets
    ADD CONSTRAINT site_assets_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.accounts(id);


--
-- TOC entry 5148 (class 2606 OID 19648)
-- Name: site_pages site_pages_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_pages
    ADD CONSTRAINT site_pages_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.site_templates(id);


--
-- TOC entry 5152 (class 2606 OID 18852)
-- Name: social_connections social_connections_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.social_platforms(id) ON DELETE CASCADE;


--
-- TOC entry 5155 (class 2606 OID 18857)
-- Name: social_post_platforms social_post_platforms_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_post_platforms
    ADD CONSTRAINT social_post_platforms_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.social_connections(id) ON DELETE CASCADE;


--
-- TOC entry 5156 (class 2606 OID 18862)
-- Name: social_post_platforms social_post_platforms_social_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_post_platforms
    ADD CONSTRAINT social_post_platforms_social_post_id_fkey FOREIGN KEY (social_post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5153 (class 2606 OID 18867)
-- Name: social_posts social_posts_blog_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_blog_post_id_fkey FOREIGN KEY (blog_post_id) REFERENCES public.blog_posts(id) ON DELETE SET NULL;


--
-- TOC entry 5154 (class 2606 OID 18872)
-- Name: social_posts social_posts_parent_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_parent_post_id_fkey FOREIGN KEY (parent_post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5185 (class 2606 OID 19848)
-- Name: stripe_application_fees stripe_application_fees_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_application_fees
    ADD CONSTRAINT stripe_application_fees_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5184 (class 2606 OID 19828)
-- Name: stripe_terminal_locations stripe_terminal_locations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_terminal_locations
    ADD CONSTRAINT stripe_terminal_locations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5183 (class 2606 OID 19806)
-- Name: stripe_terminal_readers stripe_terminal_readers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stripe_terminal_readers
    ADD CONSTRAINT stripe_terminal_readers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5186 (class 2606 OID 19914)
-- Name: subscription_events subscription_events_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_events
    ADD CONSTRAINT subscription_events_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- TOC entry 5187 (class 2606 OID 19909)
-- Name: subscription_events subscription_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_events
    ADD CONSTRAINT subscription_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5025 (class 2606 OID 17182)
-- Name: tags tags_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5173 (class 2606 OID 19611)
-- Name: template_zones template_zones_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_zones
    ADD CONSTRAINT template_zones_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.site_templates(id) ON DELETE CASCADE;


--
-- TOC entry 5193 (class 2606 OID 20246)
-- Name: tenant_app_access tenant_app_access_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_app_access
    ADD CONSTRAINT tenant_app_access_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.app_registry(id) ON DELETE CASCADE;


--
-- TOC entry 5194 (class 2606 OID 20241)
-- Name: tenant_app_access tenant_app_access_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_app_access
    ADD CONSTRAINT tenant_app_access_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5182 (class 2606 OID 19776)
-- Name: tenant_assets tenant_assets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_assets
    ADD CONSTRAINT tenant_assets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5151 (class 2606 OID 18877)
-- Name: tenant_site_settings tenant_site_settings_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant_site_settings
    ADD CONSTRAINT tenant_site_settings_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.site_themes(id);


--
-- TOC entry 5079 (class 2606 OID 19892)
-- Name: tenants tenants_subscription_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_subscription_plan_id_fkey FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plans(id);


--
-- TOC entry 5150 (class 2606 OID 18882)
-- Name: theme_sections theme_sections_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.theme_sections
    ADD CONSTRAINT theme_sections_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.site_themes(id) ON DELETE CASCADE;


--
-- TOC entry 5054 (class 2606 OID 16781)
-- Name: trailer_order_items trailer_order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_order_items
    ADD CONSTRAINT trailer_order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;


--
-- TOC entry 5055 (class 2606 OID 16776)
-- Name: trailer_order_items trailer_order_items_trailer_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_order_items
    ADD CONSTRAINT trailer_order_items_trailer_order_id_fkey FOREIGN KEY (trailer_order_id) REFERENCES public.trailer_orders(id) ON DELETE CASCADE;


--
-- TOC entry 5053 (class 2606 OID 20428)
-- Name: trailer_orders trailer_orders_tenant_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_orders
    ADD CONSTRAINT trailer_orders_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5034 (class 2606 OID 18912)
-- Name: transactions transactions_accepted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES public.accounts(id);


--
-- TOC entry 5035 (class 2606 OID 18917)
-- Name: transactions transactions_accepted_gl_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_accepted_gl_account_id_fkey FOREIGN KEY (accepted_gl_account_id) REFERENCES public.accounts_chart(id);


--
-- TOC entry 5036 (class 2606 OID 16624)
-- Name: transactions transactions_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5037 (class 2606 OID 17048)
-- Name: transactions transactions_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;


--
-- TOC entry 5038 (class 2606 OID 16629)
-- Name: transactions transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 5039 (class 2606 OID 17210)
-- Name: transactions transactions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5040 (class 2606 OID 18049)
-- Name: transactions transactions_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 5132 (class 2606 OID 18041)
-- Name: vendors vendors_default_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_default_class_id_fkey FOREIGN KEY (default_class_id) REFERENCES public.classes(id);


--
-- TOC entry 5133 (class 2606 OID 18036)
-- Name: vendors vendors_default_expense_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_default_expense_account_id_fkey FOREIGN KEY (default_expense_account_id) REFERENCES public.accounts_chart(id);


-- Completed on 2026-02-08 09:53:09

--
-- PostgreSQL database dump complete
--

\unrestrict dAy5hCPC0fIrZdjutfnv9Dg7j8BzbkQUmJP4yrzA5xz0F4sSmKcUnZGjR3W3HhL

