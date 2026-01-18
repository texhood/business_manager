--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2026-01-18 10:00:42

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
-- TOC entry 2 (class 3079 OID 32781)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 6367 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1002 (class 1247 OID 32793)
-- Name: account_role; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.account_role AS ENUM (
    'admin',
    'staff',
    'customer',
    'super_admin'
);


ALTER TYPE public.account_role OWNER TO robin;

--
-- TOC entry 1083 (class 1247 OID 33240)
-- Name: account_subtype; Type: TYPE; Schema: public; Owner: robin
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


ALTER TYPE public.account_subtype OWNER TO robin;

--
-- TOC entry 1080 (class 1247 OID 33228)
-- Name: account_type; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.account_type AS ENUM (
    'asset',
    'liability',
    'equity',
    'revenue',
    'expense'
);


ALTER TYPE public.account_type OWNER TO robin;

--
-- TOC entry 1209 (class 1247 OID 34626)
-- Name: animal_species; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.animal_species AS ENUM (
    'Cattle',
    'Sheep',
    'Goat',
    'Poultry',
    'Guard Dog',
    'Other'
);


ALTER TYPE public.animal_species OWNER TO robin;

--
-- TOC entry 1206 (class 1247 OID 34616)
-- Name: animal_status; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.animal_status AS ENUM (
    'Active',
    'Sold',
    'Dead',
    'Reference',
    'Processed'
);


ALTER TYPE public.animal_status OWNER TO robin;

--
-- TOC entry 1269 (class 1247 OID 35041)
-- Name: herd_management_mode; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.herd_management_mode AS ENUM (
    'individual',
    'aggregate'
);


ALTER TYPE public.herd_management_mode OWNER TO robin;

--
-- TOC entry 1293 (class 1247 OID 35259)
-- Name: herd_species; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.herd_species AS ENUM (
    'cattle',
    'sheep',
    'goat',
    'poultry',
    'swine',
    'other'
);


ALTER TYPE public.herd_species OWNER TO robin;

--
-- TOC entry 1128 (class 1247 OID 33556)
-- Name: item_status; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.item_status AS ENUM (
    'active',
    'inactive',
    'draft'
);


ALTER TYPE public.item_status OWNER TO robin;

--
-- TOC entry 1005 (class 1247 OID 32800)
-- Name: item_type; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.item_type AS ENUM (
    'inventory',
    'non-inventory',
    'digital'
);


ALTER TYPE public.item_type OWNER TO robin;

--
-- TOC entry 1086 (class 1247 OID 33276)
-- Name: journal_status; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.journal_status AS ENUM (
    'draft',
    'posted',
    'void'
);


ALTER TYPE public.journal_status OWNER TO robin;

--
-- TOC entry 1014 (class 1247 OID 32824)
-- Name: membership_status; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.membership_status AS ENUM (
    'active',
    'expired',
    'cancelled'
);


ALTER TYPE public.membership_status OWNER TO robin;

--
-- TOC entry 1017 (class 1247 OID 32832)
-- Name: order_status; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'ready',
    'delivered',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO robin;

--
-- TOC entry 1299 (class 1247 OID 35279)
-- Name: processing_status; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.processing_status AS ENUM (
    'Pending',
    'At Processor',
    'Complete'
);


ALTER TYPE public.processing_status OWNER TO robin;

--
-- TOC entry 1164 (class 1247 OID 34230)
-- Name: restaurant_order_status; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.restaurant_order_status AS ENUM (
    'entered',
    'in_process',
    'done',
    'complete',
    'cancelled'
);


ALTER TYPE public.restaurant_order_status OWNER TO robin;

--
-- TOC entry 1008 (class 1247 OID 32808)
-- Name: shipping_zone; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.shipping_zone AS ENUM (
    'not-shippable',
    'in-state',
    'in-country',
    'no-restrictions'
);


ALTER TYPE public.shipping_zone OWNER TO robin;

--
-- TOC entry 1011 (class 1247 OID 32818)
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.transaction_type AS ENUM (
    'income',
    'expense'
);


ALTER TYPE public.transaction_type OWNER TO robin;

--
-- TOC entry 1212 (class 1247 OID 34640)
-- Name: treatment_type; Type: TYPE; Schema: public; Owner: robin
--

CREATE TYPE public.treatment_type AS ENUM (
    'chemical',
    'mechanical'
);


ALTER TYPE public.treatment_type OWNER TO robin;

--
-- TOC entry 379 (class 1255 OID 33449)
-- Name: generate_balance_sheet(date, integer[]); Type: FUNCTION; Schema: public; Owner: robin
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


ALTER FUNCTION public.generate_balance_sheet(p_as_of_date date, p_account_ids integer[]) OWNER TO robin;

--
-- TOC entry 378 (class 1255 OID 33448)
-- Name: generate_income_statement(date, date, integer[]); Type: FUNCTION; Schema: public; Owner: robin
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


ALTER FUNCTION public.generate_income_statement(p_start_date date, p_end_date date, p_account_ids integer[]) OWNER TO robin;

--
-- TOC entry 360 (class 1255 OID 33387)
-- Name: generate_journal_entry_number(); Type: FUNCTION; Schema: public; Owner: robin
--

CREATE FUNCTION public.generate_journal_entry_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.entry_number = 'JE-' || TO_CHAR(NEW.entry_date, 'YYMM') || '-' || LPAD(nextval('journal_entry_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_journal_entry_number() OWNER TO robin;

--
-- TOC entry 356 (class 1255 OID 33204)
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: robin
--

CREATE FUNCTION public.generate_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.order_number = 'HFF-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_order_number() OWNER TO robin;

--
-- TOC entry 381 (class 1255 OID 33451)
-- Name: generate_sales_by_class(date, date); Type: FUNCTION; Schema: public; Owner: robin
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


ALTER FUNCTION public.generate_sales_by_class(p_start_date date, p_end_date date) OWNER TO robin;

--
-- TOC entry 380 (class 1255 OID 33450)
-- Name: generate_sales_by_customer(date, date, integer); Type: FUNCTION; Schema: public; Owner: robin
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


ALTER FUNCTION public.generate_sales_by_customer(p_start_date date, p_end_date date, p_limit integer) OWNER TO robin;

--
-- TOC entry 357 (class 1255 OID 33207)
-- Name: generate_trailer_order_number(); Type: FUNCTION; Schema: public; Owner: robin
--

CREATE FUNCTION public.generate_trailer_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.order_number = 'FT-' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || '-' || LPAD(nextval('trailer_order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_trailer_order_number() OWNER TO robin;

--
-- TOC entry 377 (class 1255 OID 33447)
-- Name: get_account_balance(integer, date, date); Type: FUNCTION; Schema: public; Owner: robin
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


ALTER FUNCTION public.get_account_balance(p_account_id integer, p_start_date date, p_end_date date) OWNER TO robin;

--
-- TOC entry 362 (class 1255 OID 33391)
-- Name: update_account_balances(); Type: FUNCTION; Schema: public; Owner: robin
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


ALTER FUNCTION public.update_account_balances() OWNER TO robin;

--
-- TOC entry 359 (class 1255 OID 33210)
-- Name: update_inventory_on_order(); Type: FUNCTION; Schema: public; Owner: robin
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


ALTER FUNCTION public.update_inventory_on_order() OWNER TO robin;

--
-- TOC entry 361 (class 1255 OID 33389)
-- Name: update_journal_totals(); Type: FUNCTION; Schema: public; Owner: robin
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


ALTER FUNCTION public.update_journal_totals() OWNER TO robin;

--
-- TOC entry 363 (class 1255 OID 34389)
-- Name: update_modifications_timestamp(); Type: FUNCTION; Schema: public; Owner: robin
--

CREATE FUNCTION public.update_modifications_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_modifications_timestamp() OWNER TO robin;

--
-- TOC entry 358 (class 1255 OID 35212)
-- Name: update_sale_ticket_totals(); Type: FUNCTION; Schema: public; Owner: robin
--

CREATE FUNCTION public.update_sale_ticket_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update gross amount from items
    UPDATE sale_tickets SET 
        gross_amount = COALESCE((
            SELECT SUM(line_total) FROM sale_ticket_items WHERE sale_ticket_id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id)
        ), 0),
        total_fees = COALESCE((
            SELECT SUM(amount) FROM sale_ticket_fees WHERE sale_ticket_id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id)
        ), 0)
    WHERE id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id);
    
    -- Calculate net
    UPDATE sale_tickets SET 
        net_amount = gross_amount - total_fees
    WHERE id = COALESCE(NEW.sale_ticket_id, OLD.sale_ticket_id);
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_sale_ticket_totals() OWNER TO robin;

--
-- TOC entry 365 (class 1255 OID 34604)
-- Name: update_site_designer_timestamp(); Type: FUNCTION; Schema: public; Owner: robin
--

CREATE FUNCTION public.update_site_designer_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_site_designer_timestamp() OWNER TO robin;

--
-- TOC entry 364 (class 1255 OID 34502)
-- Name: update_social_updated_at(); Type: FUNCTION; Schema: public; Owner: robin
--

CREATE FUNCTION public.update_social_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_social_updated_at() OWNER TO robin;

--
-- TOC entry 355 (class 1255 OID 33195)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: robin
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO robin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 32772)
-- Name: _migrations; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public._migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    executed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public._migrations OWNER TO robin;

--
-- TOC entry 218 (class 1259 OID 32771)
-- Name: _migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public._migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public._migrations_id_seq OWNER TO robin;

--
-- TOC entry 6368 (class 0 OID 0)
-- Dependencies: 218
-- Name: _migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public._migrations_id_seq OWNED BY public._migrations.id;


--
-- TOC entry 221 (class 1259 OID 32854)
-- Name: accounts; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.accounts OWNER TO robin;

--
-- TOC entry 246 (class 1259 OID 33284)
-- Name: accounts_chart; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.accounts_chart OWNER TO robin;

--
-- TOC entry 6369 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN accounts_chart.tenant_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.accounts_chart.tenant_id IS 'Multi-tenant: Each tenant has their own chart of accounts';


--
-- TOC entry 245 (class 1259 OID 33283)
-- Name: accounts_chart_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.accounts_chart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounts_chart_id_seq OWNER TO robin;

--
-- TOC entry 6370 (class 0 OID 0)
-- Dependencies: 245
-- Name: accounts_chart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.accounts_chart_id_seq OWNED BY public.accounts_chart.id;


--
-- TOC entry 296 (class 1259 OID 34684)
-- Name: animal_categories; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.animal_categories (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_categories OWNER TO robin;

--
-- TOC entry 298 (class 1259 OID 34702)
-- Name: animal_owners; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.animal_owners (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(100) NOT NULL,
    contact_info text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_owners OWNER TO robin;

--
-- TOC entry 304 (class 1259 OID 34803)
-- Name: animal_sales; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.animal_sales OWNER TO robin;

--
-- TOC entry 6371 (class 0 OID 0)
-- Dependencies: 304
-- Name: TABLE animal_sales; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.animal_sales IS 'Sales records for sold animals';


--
-- TOC entry 292 (class 1259 OID 34646)
-- Name: animal_types; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.animal_types (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(50) NOT NULL,
    species public.animal_species DEFAULT 'Cattle'::public.animal_species NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.animal_types OWNER TO robin;

--
-- TOC entry 302 (class 1259 OID 34742)
-- Name: animals; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.animals OWNER TO robin;

--
-- TOC entry 6372 (class 0 OID 0)
-- Dependencies: 302
-- Name: TABLE animals; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.animals IS 'Livestock inventory with historical data imported from legacy system';


--
-- TOC entry 294 (class 1259 OID 34665)
-- Name: breeds; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.breeds (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(100) NOT NULL,
    species public.animal_species DEFAULT 'Cattle'::public.animal_species NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.breeds OWNER TO robin;

--
-- TOC entry 321 (class 1259 OID 35016)
-- Name: herd_summary; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.herd_summary OWNER TO robin;

--
-- TOC entry 322 (class 1259 OID 35021)
-- Name: active_herd; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.active_herd OWNER TO robin;

--
-- TOC entry 295 (class 1259 OID 34683)
-- Name: animal_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.animal_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_categories_id_seq OWNER TO robin;

--
-- TOC entry 6373 (class 0 OID 0)
-- Dependencies: 295
-- Name: animal_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.animal_categories_id_seq OWNED BY public.animal_categories.id;


--
-- TOC entry 308 (class 1259 OID 34851)
-- Name: animal_health_records; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.animal_health_records OWNER TO robin;

--
-- TOC entry 6374 (class 0 OID 0)
-- Dependencies: 308
-- Name: TABLE animal_health_records; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.animal_health_records IS 'Vaccination, treatment, and health records';


--
-- TOC entry 307 (class 1259 OID 34850)
-- Name: animal_health_records_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.animal_health_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_health_records_id_seq OWNER TO robin;

--
-- TOC entry 6375 (class 0 OID 0)
-- Dependencies: 307
-- Name: animal_health_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.animal_health_records_id_seq OWNED BY public.animal_health_records.id;


--
-- TOC entry 297 (class 1259 OID 34701)
-- Name: animal_owners_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.animal_owners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_owners_id_seq OWNER TO robin;

--
-- TOC entry 6376 (class 0 OID 0)
-- Dependencies: 297
-- Name: animal_owners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.animal_owners_id_seq OWNED BY public.animal_owners.id;


--
-- TOC entry 303 (class 1259 OID 34802)
-- Name: animal_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.animal_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_sales_id_seq OWNER TO robin;

--
-- TOC entry 6377 (class 0 OID 0)
-- Dependencies: 303
-- Name: animal_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.animal_sales_id_seq OWNED BY public.animal_sales.id;


--
-- TOC entry 291 (class 1259 OID 34645)
-- Name: animal_types_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.animal_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_types_id_seq OWNER TO robin;

--
-- TOC entry 6378 (class 0 OID 0)
-- Dependencies: 291
-- Name: animal_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.animal_types_id_seq OWNED BY public.animal_types.id;


--
-- TOC entry 306 (class 1259 OID 34828)
-- Name: animal_weights; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.animal_weights OWNER TO robin;

--
-- TOC entry 6379 (class 0 OID 0)
-- Dependencies: 306
-- Name: TABLE animal_weights; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.animal_weights IS 'Weight tracking for growth monitoring';


--
-- TOC entry 305 (class 1259 OID 34827)
-- Name: animal_weights_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.animal_weights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animal_weights_id_seq OWNER TO robin;

--
-- TOC entry 6380 (class 0 OID 0)
-- Dependencies: 305
-- Name: animal_weights_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.animal_weights_id_seq OWNED BY public.animal_weights.id;


--
-- TOC entry 301 (class 1259 OID 34741)
-- Name: animals_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.animals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.animals_id_seq OWNER TO robin;

--
-- TOC entry 6381 (class 0 OID 0)
-- Dependencies: 301
-- Name: animals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.animals_id_seq OWNED BY public.animals.id;


--
-- TOC entry 239 (class 1259 OID 33178)
-- Name: audit_log; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_log OWNER TO robin;

--
-- TOC entry 253 (class 1259 OID 33399)
-- Name: balance_sheet; Type: VIEW; Schema: public; Owner: robin
--

CREATE VIEW public.balance_sheet AS
 SELECT account_type,
    account_code,
    name,
    current_balance AS balance
   FROM public.accounts_chart ac
  WHERE ((is_active = true) AND (account_type = ANY (ARRAY['asset'::public.account_type, 'liability'::public.account_type, 'equity'::public.account_type])))
  ORDER BY account_type, account_code;


ALTER VIEW public.balance_sheet OWNER TO robin;

--
-- TOC entry 230 (class 1259 OID 32992)
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.bank_accounts OWNER TO robin;

--
-- TOC entry 229 (class 1259 OID 32991)
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_accounts_id_seq OWNER TO robin;

--
-- TOC entry 6382 (class 0 OID 0)
-- Dependencies: 229
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- TOC entry 265 (class 1259 OID 33567)
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.blog_posts OWNER TO robin;

--
-- TOC entry 6383 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE blog_posts; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.blog_posts IS 'Blog posts for the Hood Family Farms website';


--
-- TOC entry 6384 (class 0 OID 0)
-- Dependencies: 265
-- Name: COLUMN blog_posts.slug; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.blog_posts.slug IS 'URL-friendly identifier for the post';


--
-- TOC entry 6385 (class 0 OID 0)
-- Dependencies: 265
-- Name: COLUMN blog_posts.content; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.blog_posts.content IS 'Full blog post content, can contain HTML or Markdown';


--
-- TOC entry 6386 (class 0 OID 0)
-- Dependencies: 265
-- Name: COLUMN blog_posts.status; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.blog_posts.status IS 'draft = not visible, published = visible on site, archived = hidden but preserved';


--
-- TOC entry 293 (class 1259 OID 34664)
-- Name: breeds_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.breeds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.breeds_id_seq OWNER TO robin;

--
-- TOC entry 6387 (class 0 OID 0)
-- Dependencies: 293
-- Name: breeds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.breeds_id_seq OWNED BY public.breeds.id;


--
-- TOC entry 335 (class 1259 OID 35179)
-- Name: buyers; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.buyers OWNER TO robin;

--
-- TOC entry 334 (class 1259 OID 35178)
-- Name: buyers_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.buyers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.buyers_id_seq OWNER TO robin;

--
-- TOC entry 6388 (class 0 OID 0)
-- Dependencies: 334
-- Name: buyers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.buyers_id_seq OWNED BY public.buyers.id;


--
-- TOC entry 223 (class 1259 OID 32881)
-- Name: categories; Type: TABLE; Schema: public; Owner: robin
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
    type character varying(20) DEFAULT 'expense'::character varying,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.categories OWNER TO robin;

--
-- TOC entry 222 (class 1259 OID 32880)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO robin;

--
-- TOC entry 6389 (class 0 OID 0)
-- Dependencies: 222
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 264 (class 1259 OID 33513)
-- Name: classes; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.classes (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.classes OWNER TO robin;

--
-- TOC entry 263 (class 1259 OID 33512)
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.classes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.classes_id_seq OWNER TO robin;

--
-- TOC entry 6390 (class 0 OID 0)
-- Dependencies: 263
-- Name: classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.classes_id_seq OWNED BY public.classes.id;


--
-- TOC entry 220 (class 1259 OID 32845)
-- Name: delivery_zones; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.delivery_zones (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    schedule character varying(100) NOT NULL,
    radius integer DEFAULT 20 NOT NULL,
    base_city character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.delivery_zones OWNER TO robin;

--
-- TOC entry 232 (class 1259 OID 33029)
-- Name: orders; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.orders OWNER TO robin;

--
-- TOC entry 244 (class 1259 OID 33221)
-- Name: customer_summary; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.customer_summary OWNER TO robin;

--
-- TOC entry 273 (class 1259 OID 34138)
-- Name: event_series; Type: TABLE; Schema: public; Owner: robin
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
    CONSTRAINT event_series_recurrence_type_check CHECK (((recurrence_type)::text = ANY ((ARRAY['weekly'::character varying, 'biweekly'::character varying, 'monthly'::character varying])::text[])))
);


ALTER TABLE public.event_series OWNER TO robin;

--
-- TOC entry 6391 (class 0 OID 0)
-- Dependencies: 273
-- Name: TABLE event_series; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.event_series IS 'Recurring event templates';


--
-- TOC entry 272 (class 1259 OID 34106)
-- Name: events; Type: TABLE; Schema: public; Owner: robin
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
    CONSTRAINT events_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'scheduled'::character varying, 'cancelled'::character varying, 'completed'::character varying])::text[])))
);


ALTER TABLE public.events OWNER TO robin;

--
-- TOC entry 6392 (class 0 OID 0)
-- Dependencies: 272
-- Name: TABLE events; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.events IS 'Food trailer events and schedule';


--
-- TOC entry 248 (class 1259 OID 33310)
-- Name: fiscal_periods; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.fiscal_periods OWNER TO robin;

--
-- TOC entry 247 (class 1259 OID 33309)
-- Name: fiscal_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.fiscal_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fiscal_periods_id_seq OWNER TO robin;

--
-- TOC entry 6393 (class 0 OID 0)
-- Dependencies: 247
-- Name: fiscal_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.fiscal_periods_id_seq OWNED BY public.fiscal_periods.id;


--
-- TOC entry 249 (class 1259 OID 33323)
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: robin
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
    source character varying(50),
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.journal_entries OWNER TO robin;

--
-- TOC entry 6394 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN journal_entries.source_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.journal_entries.source_id IS 'ID of the source record (e.g., transaction.id)';


--
-- TOC entry 6395 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN journal_entries.source; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.journal_entries.source IS 'Origin of the entry: transaction, manual, etc.';


--
-- TOC entry 250 (class 1259 OID 33362)
-- Name: journal_entry_lines; Type: TABLE; Schema: public; Owner: robin
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
    CONSTRAINT check_debit_or_credit CHECK ((((debit > (0)::numeric) AND (credit = (0)::numeric)) OR ((debit = (0)::numeric) AND (credit > (0)::numeric)) OR ((debit = (0)::numeric) AND (credit = (0)::numeric))))
);


ALTER TABLE public.journal_entry_lines OWNER TO robin;

--
-- TOC entry 6396 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN journal_entry_lines.class_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.journal_entry_lines.class_id IS 'Business segment classification for this line';


--
-- TOC entry 255 (class 1259 OID 33407)
-- Name: general_ledger; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.general_ledger OWNER TO robin;

--
-- TOC entry 312 (class 1259 OID 34898)
-- Name: grazing_event_animals; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.grazing_event_animals (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    grazing_event_id integer NOT NULL,
    animal_id integer NOT NULL
);


ALTER TABLE public.grazing_event_animals OWNER TO robin;

--
-- TOC entry 311 (class 1259 OID 34897)
-- Name: grazing_event_animals_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.grazing_event_animals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.grazing_event_animals_id_seq OWNER TO robin;

--
-- TOC entry 6397 (class 0 OID 0)
-- Dependencies: 311
-- Name: grazing_event_animals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.grazing_event_animals_id_seq OWNED BY public.grazing_event_animals.id;


--
-- TOC entry 325 (class 1259 OID 35046)
-- Name: herds_flocks; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.herds_flocks (
    id integer NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(100) NOT NULL,
    description text,
    management_mode public.herd_management_mode DEFAULT 'individual'::public.herd_management_mode NOT NULL,
    animal_count integer DEFAULT 0,
    current_pasture_id integer,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    species public.herd_species DEFAULT 'cattle'::public.herd_species NOT NULL
);


ALTER TABLE public.herds_flocks OWNER TO robin;

--
-- TOC entry 6398 (class 0 OID 0)
-- Dependencies: 325
-- Name: TABLE herds_flocks; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.herds_flocks IS 'Groups of animals - can be managed individually or as aggregate counts';


--
-- TOC entry 6399 (class 0 OID 0)
-- Dependencies: 325
-- Name: COLUMN herds_flocks.management_mode; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.herds_flocks.management_mode IS 'individual = track each animal separately, aggregate = just track count';


--
-- TOC entry 300 (class 1259 OID 34721)
-- Name: pastures; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.pastures OWNER TO robin;

--
-- TOC entry 6400 (class 0 OID 0)
-- Dependencies: 300
-- Name: TABLE pastures; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.pastures IS 'Pasture/paddock management';


--
-- TOC entry 337 (class 1259 OID 35273)
-- Name: herd_flock_summary; Type: VIEW; Schema: public; Owner: robin
--

CREATE VIEW public.herd_flock_summary AS
 SELECT hf.id,
    hf.tenant_id,
    hf.name,
    hf.species,
    hf.management_mode,
    hf.description,
    hf.is_active,
    p.name AS pasture_name,
        CASE
            WHEN (hf.management_mode = 'aggregate'::public.herd_management_mode) THEN (hf.animal_count)::bigint
            ELSE ( SELECT count(*) AS count
               FROM public.animals a
              WHERE ((a.herd_id = hf.id) AND (a.status = 'Active'::public.animal_status)))
        END AS current_count,
        CASE
            WHEN (hf.management_mode = 'individual'::public.herd_management_mode) THEN ( SELECT count(*) AS count
               FROM public.animals a
              WHERE (a.herd_id = hf.id))
            ELSE NULL::bigint
        END AS total_animals_ever
   FROM (public.herds_flocks hf
     LEFT JOIN public.pastures p ON ((hf.current_pasture_id = p.id)));


ALTER VIEW public.herd_flock_summary OWNER TO robin;

--
-- TOC entry 324 (class 1259 OID 35045)
-- Name: herds_flocks_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.herds_flocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.herds_flocks_id_seq OWNER TO robin;

--
-- TOC entry 6401 (class 0 OID 0)
-- Dependencies: 324
-- Name: herds_flocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.herds_flocks_id_seq OWNED BY public.herds_flocks.id;


--
-- TOC entry 254 (class 1259 OID 33403)
-- Name: income_statement; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.income_statement OWNER TO robin;

--
-- TOC entry 234 (class 1259 OID 33090)
-- Name: inventory_logs; Type: TABLE; Schema: public; Owner: robin
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
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.inventory_logs OWNER TO robin;

--
-- TOC entry 227 (class 1259 OID 32939)
-- Name: item_tags; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.item_tags (
    item_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.item_tags OWNER TO robin;

--
-- TOC entry 226 (class 1259 OID 32909)
-- Name: items; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.items OWNER TO robin;

--
-- TOC entry 6402 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN items.status; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.items.status IS 'active=can be sold/purchased and visible, inactive=hidden and disabled, draft=work in progress';


--
-- TOC entry 6403 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN items.stripe_product_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.items.stripe_product_id IS 'Stripe Product ID for this item';


--
-- TOC entry 6404 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN items.stripe_price_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.items.stripe_price_id IS 'Stripe Price ID for regular price';


--
-- TOC entry 6405 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN items.stripe_member_price_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.items.stripe_member_price_id IS 'Stripe Price ID for member price';


--
-- TOC entry 242 (class 1259 OID 33212)
-- Name: items_with_details; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.items_with_details OWNER TO robin;

--
-- TOC entry 251 (class 1259 OID 33386)
-- Name: journal_entry_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.journal_entry_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_entry_seq OWNER TO robin;

--
-- TOC entry 268 (class 1259 OID 33930)
-- Name: media; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.media OWNER TO robin;

--
-- TOC entry 6406 (class 0 OID 0)
-- Dependencies: 268
-- Name: TABLE media; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.media IS 'Centralized media/asset library';


--
-- TOC entry 6407 (class 0 OID 0)
-- Dependencies: 268
-- Name: COLUMN media.storage_key; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.media.storage_key IS 'Path or key in the storage provider (R2/S3 object key)';


--
-- TOC entry 6408 (class 0 OID 0)
-- Dependencies: 268
-- Name: COLUMN media.storage_url; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.media.storage_url IS 'Public CDN URL for serving the file';


--
-- TOC entry 269 (class 1259 OID 33961)
-- Name: media_folders; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.media_folders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media_folders OWNER TO robin;

--
-- TOC entry 6409 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE media_folders; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.media_folders IS 'Virtual folders for organizing media';


--
-- TOC entry 228 (class 1259 OID 32954)
-- Name: memberships; Type: TABLE; Schema: public; Owner: robin
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
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.memberships OWNER TO robin;

--
-- TOC entry 236 (class 1259 OID 33123)
-- Name: menu_item_ingredients; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.menu_item_ingredients OWNER TO robin;

--
-- TOC entry 281 (class 1259 OID 34363)
-- Name: menu_item_modifications; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.menu_item_modifications (
    id integer NOT NULL,
    menu_item_id uuid NOT NULL,
    modification_id integer NOT NULL,
    price_override numeric(10,2),
    is_default boolean DEFAULT false,
    group_name character varying(50),
    is_required boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL
);


ALTER TABLE public.menu_item_modifications OWNER TO robin;

--
-- TOC entry 280 (class 1259 OID 34362)
-- Name: menu_item_modifications_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.menu_item_modifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_item_modifications_id_seq OWNER TO robin;

--
-- TOC entry 6410 (class 0 OID 0)
-- Dependencies: 280
-- Name: menu_item_modifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.menu_item_modifications_id_seq OWNED BY public.menu_item_modifications.id;


--
-- TOC entry 235 (class 1259 OID 33111)
-- Name: menu_items; Type: TABLE; Schema: public; Owner: robin
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
    is_vegetarian boolean DEFAULT false,
    is_vegan boolean DEFAULT false,
    is_gluten_free boolean DEFAULT false,
    is_dairy_free boolean DEFAULT false,
    is_spicy boolean DEFAULT false,
    allergens text[],
    is_featured boolean DEFAULT false,
    item_id uuid,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    price_label character varying(100),
    stripe_product_id character varying(255),
    stripe_price_id character varying(255)
);


ALTER TABLE public.menu_items OWNER TO robin;

--
-- TOC entry 6411 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN menu_items.stripe_product_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.menu_items.stripe_product_id IS 'Stripe Product ID for POS integration';


--
-- TOC entry 6412 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN menu_items.stripe_price_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.menu_items.stripe_price_id IS 'Stripe Price ID for POS integration';


--
-- TOC entry 271 (class 1259 OID 34078)
-- Name: menu_section_items; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.menu_section_items OWNER TO robin;

--
-- TOC entry 270 (class 1259 OID 34060)
-- Name: menu_sections; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.menu_sections OWNER TO robin;

--
-- TOC entry 267 (class 1259 OID 33831)
-- Name: menus; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.menus OWNER TO robin;

--
-- TOC entry 6413 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE menus; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.menus IS 'Food trailer menus - reusable menu templates';


--
-- TOC entry 279 (class 1259 OID 34350)
-- Name: modifications; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.modifications (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100),
    price_adjustment numeric(10,2) DEFAULT 0,
    category character varying(50) DEFAULT 'general'::character varying NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL
);


ALTER TABLE public.modifications OWNER TO robin;

--
-- TOC entry 278 (class 1259 OID 34349)
-- Name: modifications_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.modifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modifications_id_seq OWNER TO robin;

--
-- TOC entry 6414 (class 0 OID 0)
-- Dependencies: 278
-- Name: modifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.modifications_id_seq OWNED BY public.modifications.id;


--
-- TOC entry 231 (class 1259 OID 33000)
-- Name: transactions; Type: TABLE; Schema: public; Owner: robin
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
    category character varying(100),
    plaid_transaction_id character varying(100),
    plaid_account_id integer,
    source character varying(50) DEFAULT 'manual'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    acceptance_status character varying(20) DEFAULT 'pending'::character varying,
    excluded_reason text,
    account_id uuid,
    class_id integer,
    exclusion_reason text,
    accepted_gl_account_id integer,
    accepted_at timestamp with time zone,
    accepted_by uuid,
    vendor_id integer,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.transactions OWNER TO robin;

--
-- TOC entry 6415 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN transactions.vendor_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.transactions.vendor_id IS 'Reference to vendors table (replaces vendor text field)';


--
-- TOC entry 6416 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN transactions.tenant_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.transactions.tenant_id IS 'Multi-tenant: Transactions belong to a specific tenant';


--
-- TOC entry 243 (class 1259 OID 33217)
-- Name: monthly_summary; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.monthly_summary OWNER TO robin;

--
-- TOC entry 233 (class 1259 OID 33065)
-- Name: order_items; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.order_items OWNER TO robin;

--
-- TOC entry 240 (class 1259 OID 33205)
-- Name: order_number_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_number_seq OWNER TO robin;

--
-- TOC entry 290 (class 1259 OID 34579)
-- Name: page_sections; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.page_sections OWNER TO robin;

--
-- TOC entry 310 (class 1259 OID 34874)
-- Name: pasture_grazing_events; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.pasture_grazing_events OWNER TO robin;

--
-- TOC entry 6417 (class 0 OID 0)
-- Dependencies: 310
-- Name: TABLE pasture_grazing_events; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.pasture_grazing_events IS 'Rotational grazing tracking';


--
-- TOC entry 309 (class 1259 OID 34873)
-- Name: pasture_grazing_events_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.pasture_grazing_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_grazing_events_id_seq OWNER TO robin;

--
-- TOC entry 6418 (class 0 OID 0)
-- Dependencies: 309
-- Name: pasture_grazing_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.pasture_grazing_events_id_seq OWNED BY public.pasture_grazing_events.id;


--
-- TOC entry 316 (class 1259 OID 34947)
-- Name: pasture_nutrients; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.pasture_nutrients OWNER TO robin;

--
-- TOC entry 6419 (class 0 OID 0)
-- Dependencies: 316
-- Name: TABLE pasture_nutrients; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.pasture_nutrients IS 'Nutrient levels from soil samples';


--
-- TOC entry 315 (class 1259 OID 34946)
-- Name: pasture_nutrients_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.pasture_nutrients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_nutrients_id_seq OWNER TO robin;

--
-- TOC entry 6420 (class 0 OID 0)
-- Dependencies: 315
-- Name: pasture_nutrients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.pasture_nutrients_id_seq OWNED BY public.pasture_nutrients.id;


--
-- TOC entry 314 (class 1259 OID 34923)
-- Name: pasture_soil_samples; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.pasture_soil_samples OWNER TO robin;

--
-- TOC entry 6421 (class 0 OID 0)
-- Dependencies: 314
-- Name: TABLE pasture_soil_samples; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.pasture_soil_samples IS 'Soil testing records';


--
-- TOC entry 313 (class 1259 OID 34922)
-- Name: pasture_soil_samples_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.pasture_soil_samples_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_soil_samples_id_seq OWNER TO robin;

--
-- TOC entry 6422 (class 0 OID 0)
-- Dependencies: 313
-- Name: pasture_soil_samples_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.pasture_soil_samples_id_seq OWNED BY public.pasture_soil_samples.id;


--
-- TOC entry 318 (class 1259 OID 34967)
-- Name: pasture_tasks; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.pasture_tasks OWNER TO robin;

--
-- TOC entry 6423 (class 0 OID 0)
-- Dependencies: 318
-- Name: TABLE pasture_tasks; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.pasture_tasks IS 'Pasture maintenance tasks';


--
-- TOC entry 323 (class 1259 OID 35026)
-- Name: pasture_status; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.pasture_status OWNER TO robin;

--
-- TOC entry 317 (class 1259 OID 34966)
-- Name: pasture_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.pasture_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_tasks_id_seq OWNER TO robin;

--
-- TOC entry 6424 (class 0 OID 0)
-- Dependencies: 317
-- Name: pasture_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.pasture_tasks_id_seq OWNED BY public.pasture_tasks.id;


--
-- TOC entry 320 (class 1259 OID 34993)
-- Name: pasture_treatments; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.pasture_treatments OWNER TO robin;

--
-- TOC entry 6425 (class 0 OID 0)
-- Dependencies: 320
-- Name: TABLE pasture_treatments; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.pasture_treatments IS 'Chemical and mechanical pasture treatments';


--
-- TOC entry 319 (class 1259 OID 34992)
-- Name: pasture_treatments_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.pasture_treatments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pasture_treatments_id_seq OWNER TO robin;

--
-- TOC entry 6426 (class 0 OID 0)
-- Dependencies: 319
-- Name: pasture_treatments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.pasture_treatments_id_seq OWNED BY public.pasture_treatments.id;


--
-- TOC entry 299 (class 1259 OID 34720)
-- Name: pastures_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.pastures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pastures_id_seq OWNER TO robin;

--
-- TOC entry 6427 (class 0 OID 0)
-- Dependencies: 299
-- Name: pastures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.pastures_id_seq OWNED BY public.pastures.id;


--
-- TOC entry 262 (class 1259 OID 33469)
-- Name: plaid_accounts; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.plaid_accounts (
    id integer NOT NULL,
    plaid_item_id integer,
    account_id text NOT NULL,
    name text,
    type text,
    mask text,
    official_name character varying(255),
    linked_account_id integer,
    is_active boolean DEFAULT true,
    subtype character varying(50),
    current_balance numeric(12,2),
    available_balance numeric(12,2),
    iso_currency_code character varying(3) DEFAULT 'USD'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.plaid_accounts OWNER TO robin;

--
-- TOC entry 261 (class 1259 OID 33468)
-- Name: plaid_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.plaid_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plaid_accounts_id_seq OWNER TO robin;

--
-- TOC entry 6428 (class 0 OID 0)
-- Dependencies: 261
-- Name: plaid_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.plaid_accounts_id_seq OWNED BY public.plaid_accounts.id;


--
-- TOC entry 260 (class 1259 OID 33459)
-- Name: plaid_items; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.plaid_items (
    id integer NOT NULL,
    access_token text NOT NULL,
    item_id text NOT NULL,
    institution_name text,
    created_at timestamp without time zone DEFAULT now(),
    institution_id text,
    cursor text,
    status text DEFAULT 'active'::text,
    error_code text,
    error_message text,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.plaid_items OWNER TO robin;

--
-- TOC entry 259 (class 1259 OID 33458)
-- Name: plaid_items_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.plaid_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.plaid_items_id_seq OWNER TO robin;

--
-- TOC entry 6429 (class 0 OID 0)
-- Dependencies: 259
-- Name: plaid_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.plaid_items_id_seq OWNED BY public.plaid_items.id;


--
-- TOC entry 275 (class 1259 OID 34202)
-- Name: pos_order_items; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.pos_order_items OWNER TO robin;

--
-- TOC entry 6430 (class 0 OID 0)
-- Dependencies: 275
-- Name: TABLE pos_order_items; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.pos_order_items IS 'Line items within POS orders';


--
-- TOC entry 274 (class 1259 OID 34175)
-- Name: pos_orders; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.pos_orders OWNER TO robin;

--
-- TOC entry 6431 (class 0 OID 0)
-- Dependencies: 274
-- Name: TABLE pos_orders; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.pos_orders IS 'Point-of-sale orders from the POS terminal';


--
-- TOC entry 6432 (class 0 OID 0)
-- Dependencies: 274
-- Name: COLUMN pos_orders.order_number; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.pos_orders.order_number IS 'Human-readable order number (YYYYMMDD-NNN format)';


--
-- TOC entry 6433 (class 0 OID 0)
-- Dependencies: 274
-- Name: COLUMN pos_orders.payment_intent_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.pos_orders.payment_intent_id IS 'Stripe PaymentIntent ID for card payments';


--
-- TOC entry 339 (class 1259 OID 35288)
-- Name: processing_records; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.processing_records OWNER TO robin;

--
-- TOC entry 6434 (class 0 OID 0)
-- Dependencies: 339
-- Name: TABLE processing_records; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.processing_records IS 'Track animals or herds sent for processing';


--
-- TOC entry 6435 (class 0 OID 0)
-- Dependencies: 339
-- Name: COLUMN processing_records.processor_contact; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.processing_records.processor_contact IS 'Contact info (phone, email) for the processor';


--
-- TOC entry 6436 (class 0 OID 0)
-- Dependencies: 339
-- Name: COLUMN processing_records.hanging_weight_lbs; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.processing_records.hanging_weight_lbs IS 'Hanging/carcass weight in pounds';


--
-- TOC entry 6437 (class 0 OID 0)
-- Dependencies: 339
-- Name: COLUMN processing_records.packaged_weight_lbs; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.processing_records.packaged_weight_lbs IS 'Final packaged weight in pounds';


--
-- TOC entry 6438 (class 0 OID 0)
-- Dependencies: 339
-- Name: COLUMN processing_records.cost; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.processing_records.cost IS 'Total processing cost';


--
-- TOC entry 6439 (class 0 OID 0)
-- Dependencies: 339
-- Name: CONSTRAINT chk_animal_or_herd ON processing_records; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON CONSTRAINT chk_animal_or_herd ON public.processing_records IS 'Either animal_id OR herd_id must be set, not both';


--
-- TOC entry 338 (class 1259 OID 35287)
-- Name: processing_records_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.processing_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.processing_records_id_seq OWNER TO robin;

--
-- TOC entry 6440 (class 0 OID 0)
-- Dependencies: 338
-- Name: processing_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.processing_records_id_seq OWNED BY public.processing_records.id;


--
-- TOC entry 340 (class 1259 OID 35327)
-- Name: processing_records_summary; Type: VIEW; Schema: public; Owner: robin
--

CREATE VIEW public.processing_records_summary AS
 SELECT pr.id,
    pr.tenant_id,
    pr.animal_id,
    pr.herd_id,
    pr.processing_date,
    pr.processor_name,
    pr.processor_contact,
    pr.status,
    pr.hanging_weight_lbs,
    pr.packaged_weight_lbs,
    pr.cost,
    pr.notes,
    pr.completed_date,
    pr.created_at,
    pr.updated_at,
    a.ear_tag AS animal_ear_tag,
    a.name AS animal_name,
    at.species AS animal_species,
    hf.name AS herd_name,
    hf.species AS herd_species,
        CASE
            WHEN (hf.management_mode = 'aggregate'::public.herd_management_mode) THEN (hf.animal_count)::bigint
            ELSE ( SELECT count(*) AS count
               FROM public.animals ha
              WHERE ((ha.herd_id = hf.id) AND (ha.status = 'Active'::public.animal_status)))
        END AS herd_animal_count,
    COALESCE(a.ear_tag, hf.name) AS display_name,
        CASE
            WHEN (a.id IS NOT NULL) THEN 'animal'::text
            ELSE 'herd'::text
        END AS record_type,
    COALESCE((at.species)::text, (hf.species)::text) AS species
   FROM (((public.processing_records pr
     LEFT JOIN public.animals a ON ((pr.animal_id = a.id)))
     LEFT JOIN public.animal_types at ON ((a.animal_type_id = at.id)))
     LEFT JOIN public.herds_flocks hf ON ((pr.herd_id = hf.id)));


ALTER VIEW public.processing_records_summary OWNER TO robin;

--
-- TOC entry 342 (class 1259 OID 35344)
-- Name: rainfall_records; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.rainfall_records OWNER TO robin;

--
-- TOC entry 341 (class 1259 OID 35343)
-- Name: rainfall_records_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.rainfall_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rainfall_records_id_seq OWNER TO robin;

--
-- TOC entry 6441 (class 0 OID 0)
-- Dependencies: 341
-- Name: rainfall_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.rainfall_records_id_seq OWNED BY public.rainfall_records.id;


--
-- TOC entry 257 (class 1259 OID 33422)
-- Name: report_configurations; Type: TABLE; Schema: public; Owner: robin
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
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.report_configurations OWNER TO robin;

--
-- TOC entry 256 (class 1259 OID 33421)
-- Name: report_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.report_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.report_configurations_id_seq OWNER TO robin;

--
-- TOC entry 6442 (class 0 OID 0)
-- Dependencies: 256
-- Name: report_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.report_configurations_id_seq OWNED BY public.report_configurations.id;


--
-- TOC entry 277 (class 1259 OID 34282)
-- Name: restaurant_order_items; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.restaurant_order_items OWNER TO robin;

--
-- TOC entry 6443 (class 0 OID 0)
-- Dependencies: 277
-- Name: TABLE restaurant_order_items; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.restaurant_order_items IS 'Line items within restaurant orders';


--
-- TOC entry 6444 (class 0 OID 0)
-- Dependencies: 277
-- Name: COLUMN restaurant_order_items.tenant_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.restaurant_order_items.tenant_id IS 'Tenant ID for defense-in-depth isolation, should match parent order tenant_id';


--
-- TOC entry 276 (class 1259 OID 34241)
-- Name: restaurant_orders; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.restaurant_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
    order_number character varying(50) NOT NULL,
    ticket_number integer,
    menu_id uuid,
    customer_name character varying(255),
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
    phone_number character varying(20),
    reissue_count integer DEFAULT 0,
    CONSTRAINT restaurant_orders_order_type_check CHECK (((order_type)::text = ANY ((ARRAY['dine_in'::character varying, 'takeout'::character varying, 'delivery'::character varying])::text[]))),
    CONSTRAINT restaurant_orders_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['card'::character varying, 'cash'::character varying, 'split'::character varying, 'unpaid'::character varying])::text[]))),
    CONSTRAINT restaurant_orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['unpaid'::character varying, 'paid'::character varying, 'refunded'::character varying])::text[])))
);


ALTER TABLE public.restaurant_orders OWNER TO robin;

--
-- TOC entry 6445 (class 0 OID 0)
-- Dependencies: 276
-- Name: TABLE restaurant_orders; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.restaurant_orders IS 'Restaurant POS orders with kitchen workflow status tracking';


--
-- TOC entry 6446 (class 0 OID 0)
-- Dependencies: 276
-- Name: COLUMN restaurant_orders.ticket_number; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.restaurant_orders.ticket_number IS 'Short number for kitchen display (resets daily)';


--
-- TOC entry 6447 (class 0 OID 0)
-- Dependencies: 276
-- Name: COLUMN restaurant_orders.status; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.restaurant_orders.status IS 'Order workflow: entered -> in_process -> done -> complete';


--
-- TOC entry 6448 (class 0 OID 0)
-- Dependencies: 276
-- Name: COLUMN restaurant_orders.phone_number; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.restaurant_orders.phone_number IS 'Customer phone number for SMS notification when order is ready';


--
-- TOC entry 6449 (class 0 OID 0)
-- Dependencies: 276
-- Name: COLUMN restaurant_orders.reissue_count; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.restaurant_orders.reissue_count IS 'Number of times this order has been reissued (0 = never reissued)';


--
-- TOC entry 333 (class 1259 OID 35158)
-- Name: sale_fee_types; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.sale_fee_types OWNER TO robin;

--
-- TOC entry 332 (class 1259 OID 35157)
-- Name: sale_fee_types_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.sale_fee_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_fee_types_id_seq OWNER TO robin;

--
-- TOC entry 6450 (class 0 OID 0)
-- Dependencies: 332
-- Name: sale_fee_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.sale_fee_types_id_seq OWNED BY public.sale_fee_types.id;


--
-- TOC entry 331 (class 1259 OID 35136)
-- Name: sale_ticket_fees; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.sale_ticket_fees OWNER TO robin;

--
-- TOC entry 6451 (class 0 OID 0)
-- Dependencies: 331
-- Name: TABLE sale_ticket_fees; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.sale_ticket_fees IS 'Fees deducted from sale proceeds';


--
-- TOC entry 330 (class 1259 OID 35135)
-- Name: sale_ticket_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.sale_ticket_fees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_ticket_fees_id_seq OWNER TO robin;

--
-- TOC entry 6452 (class 0 OID 0)
-- Dependencies: 330
-- Name: sale_ticket_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.sale_ticket_fees_id_seq OWNED BY public.sale_ticket_fees.id;


--
-- TOC entry 329 (class 1259 OID 35107)
-- Name: sale_ticket_items; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.sale_ticket_items OWNER TO robin;

--
-- TOC entry 6453 (class 0 OID 0)
-- Dependencies: 329
-- Name: TABLE sale_ticket_items; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.sale_ticket_items IS 'Individual animals or groups sold on a ticket';


--
-- TOC entry 328 (class 1259 OID 35106)
-- Name: sale_ticket_items_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.sale_ticket_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_ticket_items_id_seq OWNER TO robin;

--
-- TOC entry 6454 (class 0 OID 0)
-- Dependencies: 328
-- Name: sale_ticket_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.sale_ticket_items_id_seq OWNED BY public.sale_ticket_items.id;


--
-- TOC entry 327 (class 1259 OID 35083)
-- Name: sale_tickets; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.sale_tickets OWNER TO robin;

--
-- TOC entry 6455 (class 0 OID 0)
-- Dependencies: 327
-- Name: TABLE sale_tickets; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.sale_tickets IS 'Sale events recording animals sold and fees charged';


--
-- TOC entry 336 (class 1259 OID 35204)
-- Name: sale_ticket_summary; Type: VIEW; Schema: public; Owner: robin
--

CREATE VIEW public.sale_ticket_summary AS
 SELECT id,
    tenant_id,
    ticket_number,
    sale_date,
    sold_to,
    gross_amount,
    total_fees,
    net_amount,
    payment_received,
    payment_date,
    ( SELECT count(*) AS count
           FROM public.sale_ticket_items sti
          WHERE (sti.sale_ticket_id = st.id)) AS item_count,
    ( SELECT sum(sti.head_count) AS sum
           FROM public.sale_ticket_items sti
          WHERE (sti.sale_ticket_id = st.id)) AS total_head
   FROM public.sale_tickets st;


ALTER VIEW public.sale_ticket_summary OWNER TO robin;

--
-- TOC entry 326 (class 1259 OID 35082)
-- Name: sale_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.sale_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_tickets_id_seq OWNER TO robin;

--
-- TOC entry 6456 (class 0 OID 0)
-- Dependencies: 326
-- Name: sale_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.sale_tickets_id_seq OWNED BY public.sale_tickets.id;


--
-- TOC entry 289 (class 1259 OID 34564)
-- Name: site_pages; Type: TABLE; Schema: public; Owner: robin
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
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.site_pages OWNER TO robin;

--
-- TOC entry 286 (class 1259 OID 34507)
-- Name: site_themes; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.site_themes OWNER TO robin;

--
-- TOC entry 283 (class 1259 OID 34422)
-- Name: social_connections; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.social_connections OWNER TO robin;

--
-- TOC entry 282 (class 1259 OID 34407)
-- Name: social_platforms; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.social_platforms OWNER TO robin;

--
-- TOC entry 285 (class 1259 OID 34465)
-- Name: social_post_platforms; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.social_post_platforms OWNER TO robin;

--
-- TOC entry 284 (class 1259 OID 34441)
-- Name: social_posts; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.social_posts OWNER TO robin;

--
-- TOC entry 225 (class 1259 OID 32898)
-- Name: tags; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid
);


ALTER TABLE public.tags OWNER TO robin;

--
-- TOC entry 224 (class 1259 OID 32897)
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO robin;

--
-- TOC entry 6457 (class 0 OID 0)
-- Dependencies: 224
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- TOC entry 288 (class 1259 OID 34541)
-- Name: tenant_site_settings; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.tenant_site_settings OWNER TO robin;

--
-- TOC entry 266 (class 1259 OID 33595)
-- Name: tenants; Type: TABLE; Schema: public; Owner: robin
--

CREATE TABLE public.tenants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    plan character varying(50) DEFAULT 'starter'::character varying,
    stripe_customer_id character varying(255),
    stripe_subscription_id character varying(255),
    subscription_status character varying(50) DEFAULT 'active'::character varying,
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
    description text
);


ALTER TABLE public.tenants OWNER TO robin;

--
-- TOC entry 6458 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE tenants; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.tenants IS 'Multi-tenant support - each tenant is a separate business/farm';


--
-- TOC entry 287 (class 1259 OID 34522)
-- Name: theme_sections; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.theme_sections OWNER TO robin;

--
-- TOC entry 238 (class 1259 OID 33158)
-- Name: trailer_order_items; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.trailer_order_items OWNER TO robin;

--
-- TOC entry 241 (class 1259 OID 33208)
-- Name: trailer_order_number_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.trailer_order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trailer_order_number_seq OWNER TO robin;

--
-- TOC entry 237 (class 1259 OID 33140)
-- Name: trailer_orders; Type: TABLE; Schema: public; Owner: robin
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
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.trailer_orders OWNER TO robin;

--
-- TOC entry 252 (class 1259 OID 33395)
-- Name: trial_balance; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.trial_balance OWNER TO robin;

--
-- TOC entry 258 (class 1259 OID 33442)
-- Name: v_account_balances; Type: VIEW; Schema: public; Owner: robin
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


ALTER VIEW public.v_account_balances OWNER TO robin;

--
-- TOC entry 344 (class 1259 OID 35362)
-- Name: vendors; Type: TABLE; Schema: public; Owner: robin
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


ALTER TABLE public.vendors OWNER TO robin;

--
-- TOC entry 6459 (class 0 OID 0)
-- Dependencies: 344
-- Name: TABLE vendors; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON TABLE public.vendors IS 'Vendors/suppliers for expense tracking';


--
-- TOC entry 6460 (class 0 OID 0)
-- Dependencies: 344
-- Name: COLUMN vendors.payment_terms; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.vendors.payment_terms IS 'e.g., Net 30, Due on Receipt, etc.';


--
-- TOC entry 6461 (class 0 OID 0)
-- Dependencies: 344
-- Name: COLUMN vendors.default_expense_account_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.vendors.default_expense_account_id IS 'Default GL account for expenses from this vendor';


--
-- TOC entry 6462 (class 0 OID 0)
-- Dependencies: 344
-- Name: COLUMN vendors.default_class_id; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON COLUMN public.vendors.default_class_id IS 'Default business class for expenses from this vendor';


--
-- TOC entry 343 (class 1259 OID 35361)
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: robin
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO robin;

--
-- TOC entry 6463 (class 0 OID 0)
-- Dependencies: 343
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: robin
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- TOC entry 5206 (class 2604 OID 32775)
-- Name: _migrations id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public._migrations ALTER COLUMN id SET DEFAULT nextval('public._migrations_id_seq'::regclass);


--
-- TOC entry 5313 (class 2604 OID 33287)
-- Name: accounts_chart id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts_chart ALTER COLUMN id SET DEFAULT nextval('public.accounts_chart_id_seq'::regclass);


--
-- TOC entry 5524 (class 2604 OID 34687)
-- Name: animal_categories id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_categories ALTER COLUMN id SET DEFAULT nextval('public.animal_categories_id_seq'::regclass);


--
-- TOC entry 5548 (class 2604 OID 34854)
-- Name: animal_health_records id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_health_records ALTER COLUMN id SET DEFAULT nextval('public.animal_health_records_id_seq'::regclass);


--
-- TOC entry 5527 (class 2604 OID 34705)
-- Name: animal_owners id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_owners ALTER COLUMN id SET DEFAULT nextval('public.animal_owners_id_seq'::regclass);


--
-- TOC entry 5541 (class 2604 OID 34806)
-- Name: animal_sales id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_sales ALTER COLUMN id SET DEFAULT nextval('public.animal_sales_id_seq'::regclass);


--
-- TOC entry 5516 (class 2604 OID 34649)
-- Name: animal_types id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_types ALTER COLUMN id SET DEFAULT nextval('public.animal_types_id_seq'::regclass);


--
-- TOC entry 5545 (class 2604 OID 34831)
-- Name: animal_weights id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_weights ALTER COLUMN id SET DEFAULT nextval('public.animal_weights_id_seq'::regclass);


--
-- TOC entry 5536 (class 2604 OID 34745)
-- Name: animals id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals ALTER COLUMN id SET DEFAULT nextval('public.animals_id_seq'::regclass);


--
-- TOC entry 5251 (class 2604 OID 32995)
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- TOC entry 5520 (class 2604 OID 34668)
-- Name: breeds id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.breeds ALTER COLUMN id SET DEFAULT nextval('public.breeds_id_seq'::regclass);


--
-- TOC entry 5602 (class 2604 OID 35182)
-- Name: buyers id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.buyers ALTER COLUMN id SET DEFAULT nextval('public.buyers_id_seq'::regclass);


--
-- TOC entry 5221 (class 2604 OID 32884)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 5352 (class 2604 OID 33516)
-- Name: classes id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.classes ALTER COLUMN id SET DEFAULT nextval('public.classes_id_seq'::regclass);


--
-- TOC entry 5322 (class 2604 OID 33313)
-- Name: fiscal_periods id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.fiscal_periods ALTER COLUMN id SET DEFAULT nextval('public.fiscal_periods_id_seq'::regclass);


--
-- TOC entry 5555 (class 2604 OID 34901)
-- Name: grazing_event_animals id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.grazing_event_animals ALTER COLUMN id SET DEFAULT nextval('public.grazing_event_animals_id_seq'::regclass);


--
-- TOC entry 5573 (class 2604 OID 35049)
-- Name: herds_flocks id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.herds_flocks ALTER COLUMN id SET DEFAULT nextval('public.herds_flocks_id_seq'::regclass);


--
-- TOC entry 5446 (class 2604 OID 34366)
-- Name: menu_item_modifications id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_item_modifications ALTER COLUMN id SET DEFAULT nextval('public.menu_item_modifications_id_seq'::regclass);


--
-- TOC entry 5438 (class 2604 OID 34353)
-- Name: modifications id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.modifications ALTER COLUMN id SET DEFAULT nextval('public.modifications_id_seq'::regclass);


--
-- TOC entry 5551 (class 2604 OID 34877)
-- Name: pasture_grazing_events id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_grazing_events ALTER COLUMN id SET DEFAULT nextval('public.pasture_grazing_events_id_seq'::regclass);


--
-- TOC entry 5561 (class 2604 OID 34950)
-- Name: pasture_nutrients id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_nutrients ALTER COLUMN id SET DEFAULT nextval('public.pasture_nutrients_id_seq'::regclass);


--
-- TOC entry 5557 (class 2604 OID 34926)
-- Name: pasture_soil_samples id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_soil_samples ALTER COLUMN id SET DEFAULT nextval('public.pasture_soil_samples_id_seq'::regclass);


--
-- TOC entry 5564 (class 2604 OID 34970)
-- Name: pasture_tasks id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_tasks ALTER COLUMN id SET DEFAULT nextval('public.pasture_tasks_id_seq'::regclass);


--
-- TOC entry 5569 (class 2604 OID 34996)
-- Name: pasture_treatments id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_treatments ALTER COLUMN id SET DEFAULT nextval('public.pasture_treatments_id_seq'::regclass);


--
-- TOC entry 5531 (class 2604 OID 34724)
-- Name: pastures id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pastures ALTER COLUMN id SET DEFAULT nextval('public.pastures_id_seq'::regclass);


--
-- TOC entry 5347 (class 2604 OID 33472)
-- Name: plaid_accounts id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.plaid_accounts ALTER COLUMN id SET DEFAULT nextval('public.plaid_accounts_id_seq'::regclass);


--
-- TOC entry 5343 (class 2604 OID 33462)
-- Name: plaid_items id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.plaid_items ALTER COLUMN id SET DEFAULT nextval('public.plaid_items_id_seq'::regclass);


--
-- TOC entry 5607 (class 2604 OID 35291)
-- Name: processing_records id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.processing_records ALTER COLUMN id SET DEFAULT nextval('public.processing_records_id_seq'::regclass);


--
-- TOC entry 5612 (class 2604 OID 35347)
-- Name: rainfall_records id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.rainfall_records ALTER COLUMN id SET DEFAULT nextval('public.rainfall_records_id_seq'::regclass);


--
-- TOC entry 5338 (class 2604 OID 33425)
-- Name: report_configurations id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.report_configurations ALTER COLUMN id SET DEFAULT nextval('public.report_configurations_id_seq'::regclass);


--
-- TOC entry 5596 (class 2604 OID 35161)
-- Name: sale_fee_types id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_fee_types ALTER COLUMN id SET DEFAULT nextval('public.sale_fee_types_id_seq'::regclass);


--
-- TOC entry 5593 (class 2604 OID 35139)
-- Name: sale_ticket_fees id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_fees ALTER COLUMN id SET DEFAULT nextval('public.sale_ticket_fees_id_seq'::regclass);


--
-- TOC entry 5589 (class 2604 OID 35110)
-- Name: sale_ticket_items id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_items ALTER COLUMN id SET DEFAULT nextval('public.sale_ticket_items_id_seq'::regclass);


--
-- TOC entry 5581 (class 2604 OID 35086)
-- Name: sale_tickets id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_tickets ALTER COLUMN id SET DEFAULT nextval('public.sale_tickets_id_seq'::regclass);


--
-- TOC entry 5228 (class 2604 OID 32901)
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- TOC entry 5615 (class 2604 OID 35365)
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- TOC entry 5634 (class 2606 OID 32780)
-- Name: _migrations _migrations_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_name_key UNIQUE (name);


--
-- TOC entry 5636 (class 2606 OID 32778)
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5728 (class 2606 OID 33298)
-- Name: accounts_chart accounts_chart_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts_chart
    ADD CONSTRAINT accounts_chart_pkey PRIMARY KEY (id);


--
-- TOC entry 5730 (class 2606 OID 35441)
-- Name: accounts_chart accounts_chart_tenant_account_code_unique; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts_chart
    ADD CONSTRAINT accounts_chart_tenant_account_code_unique UNIQUE (tenant_id, account_code);


--
-- TOC entry 5640 (class 2606 OID 32868)
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5642 (class 2606 OID 35443)
-- Name: accounts accounts_tenant_email_unique; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_tenant_email_unique UNIQUE (tenant_id, email);


--
-- TOC entry 6464 (class 0 OID 0)
-- Dependencies: 5642
-- Name: CONSTRAINT accounts_tenant_email_unique ON accounts; Type: COMMENT; Schema: public; Owner: robin
--

COMMENT ON CONSTRAINT accounts_tenant_email_unique ON public.accounts IS 'Email must be unique within each tenant, but can be reused across tenants';


--
-- TOC entry 5923 (class 2606 OID 34693)
-- Name: animal_categories animal_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_categories
    ADD CONSTRAINT animal_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5925 (class 2606 OID 34695)
-- Name: animal_categories animal_categories_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_categories
    ADD CONSTRAINT animal_categories_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 5956 (class 2606 OID 34860)
-- Name: animal_health_records animal_health_records_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_health_records
    ADD CONSTRAINT animal_health_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5927 (class 2606 OID 34712)
-- Name: animal_owners animal_owners_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_owners
    ADD CONSTRAINT animal_owners_pkey PRIMARY KEY (id);


--
-- TOC entry 5929 (class 2606 OID 34714)
-- Name: animal_owners animal_owners_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_owners
    ADD CONSTRAINT animal_owners_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 5947 (class 2606 OID 34813)
-- Name: animal_sales animal_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_sales
    ADD CONSTRAINT animal_sales_pkey PRIMARY KEY (id);


--
-- TOC entry 5915 (class 2606 OID 34656)
-- Name: animal_types animal_types_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_types
    ADD CONSTRAINT animal_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5917 (class 2606 OID 34658)
-- Name: animal_types animal_types_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_types
    ADD CONSTRAINT animal_types_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 5952 (class 2606 OID 34837)
-- Name: animal_weights animal_weights_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_weights
    ADD CONSTRAINT animal_weights_pkey PRIMARY KEY (id);


--
-- TOC entry 5936 (class 2606 OID 34753)
-- Name: animals animals_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_pkey PRIMARY KEY (id);


--
-- TOC entry 5723 (class 2606 OID 33186)
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- TOC entry 5681 (class 2606 OID 32999)
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5769 (class 2606 OID 33579)
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5771 (class 2606 OID 33581)
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- TOC entry 5919 (class 2606 OID 34675)
-- Name: breeds breeds_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_pkey PRIMARY KEY (id);


--
-- TOC entry 5921 (class 2606 OID 34677)
-- Name: breeds breeds_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 6006 (class 2606 OID 35190)
-- Name: buyers buyers_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_pkey PRIMARY KEY (id);


--
-- TOC entry 6008 (class 2606 OID 35192)
-- Name: buyers buyers_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 5649 (class 2606 OID 32894)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 5651 (class 2606 OID 32892)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5653 (class 2606 OID 32896)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 5767 (class 2606 OID 33523)
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- TOC entry 5638 (class 2606 OID 32853)
-- Name: delivery_zones delivery_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (id);


--
-- TOC entry 5825 (class 2606 OID 34150)
-- Name: event_series event_series_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.event_series
    ADD CONSTRAINT event_series_pkey PRIMARY KEY (id);


--
-- TOC entry 5815 (class 2606 OID 34120)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5817 (class 2606 OID 34122)
-- Name: events events_tenant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tenant_id_slug_key UNIQUE (tenant_id, slug);


--
-- TOC entry 5736 (class 2606 OID 33317)
-- Name: fiscal_periods fiscal_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_pkey PRIMARY KEY (id);


--
-- TOC entry 5964 (class 2606 OID 34906)
-- Name: grazing_event_animals grazing_event_animals_grazing_event_id_animal_id_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_grazing_event_id_animal_id_key UNIQUE (grazing_event_id, animal_id);


--
-- TOC entry 5966 (class 2606 OID 34904)
-- Name: grazing_event_animals grazing_event_animals_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_pkey PRIMARY KEY (id);


--
-- TOC entry 5984 (class 2606 OID 35060)
-- Name: herds_flocks herds_flocks_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.herds_flocks
    ADD CONSTRAINT herds_flocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5986 (class 2606 OID 35062)
-- Name: herds_flocks herds_flocks_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.herds_flocks
    ADD CONSTRAINT herds_flocks_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 5708 (class 2606 OID 33098)
-- Name: inventory_logs inventory_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5674 (class 2606 OID 32943)
-- Name: item_tags item_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_pkey PRIMARY KEY (item_id, tag_id);


--
-- TOC entry 5670 (class 2606 OID 32927)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- TOC entry 5672 (class 2606 OID 32929)
-- Name: items items_sku_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_sku_key UNIQUE (sku);


--
-- TOC entry 5744 (class 2606 OID 33338)
-- Name: journal_entries journal_entries_entry_number_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_entry_number_key UNIQUE (entry_number);


--
-- TOC entry 5746 (class 2606 OID 33336)
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5751 (class 2606 OID 33373)
-- Name: journal_entry_lines journal_entry_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 5801 (class 2606 OID 33970)
-- Name: media_folders media_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_pkey PRIMARY KEY (id);


--
-- TOC entry 5803 (class 2606 OID 33972)
-- Name: media_folders media_folders_tenant_id_parent_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_tenant_id_parent_id_slug_key UNIQUE (tenant_id, parent_id, slug);


--
-- TOC entry 5797 (class 2606 OID 33945)
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- TOC entry 5679 (class 2606 OID 32966)
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- TOC entry 5715 (class 2606 OID 33129)
-- Name: menu_item_ingredients menu_item_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_item_ingredients
    ADD CONSTRAINT menu_item_ingredients_pkey PRIMARY KEY (id);


--
-- TOC entry 5865 (class 2606 OID 34373)
-- Name: menu_item_modifications menu_item_modifications_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_item_modifications
    ADD CONSTRAINT menu_item_modifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5867 (class 2606 OID 34399)
-- Name: menu_item_modifications menu_item_modifications_tenant_item_mod_unique; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_item_modifications
    ADD CONSTRAINT menu_item_modifications_tenant_item_mod_unique UNIQUE (tenant_id, menu_item_id, modification_id);


--
-- TOC entry 5713 (class 2606 OID 33122)
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5811 (class 2606 OID 34088)
-- Name: menu_section_items menu_section_items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_section_items
    ADD CONSTRAINT menu_section_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5813 (class 2606 OID 34090)
-- Name: menu_section_items menu_section_items_section_id_menu_item_id_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_section_items
    ADD CONSTRAINT menu_section_items_section_id_menu_item_id_key UNIQUE (section_id, menu_item_id);


--
-- TOC entry 5807 (class 2606 OID 34072)
-- Name: menu_sections menu_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5788 (class 2606 OID 33846)
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (id);


--
-- TOC entry 5790 (class 2606 OID 33848)
-- Name: menus menus_tenant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_tenant_id_slug_key UNIQUE (tenant_id, slug);


--
-- TOC entry 5861 (class 2606 OID 34361)
-- Name: modifications modifications_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.modifications
    ADD CONSTRAINT modifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5704 (class 2606 OID 33077)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5698 (class 2606 OID 33050)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 5700 (class 2606 OID 33048)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5911 (class 2606 OID 34593)
-- Name: page_sections page_sections_page_id_section_type_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_page_id_section_type_key UNIQUE (page_id, section_type);


--
-- TOC entry 5913 (class 2606 OID 34591)
-- Name: page_sections page_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5962 (class 2606 OID 34884)
-- Name: pasture_grazing_events pasture_grazing_events_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_grazing_events
    ADD CONSTRAINT pasture_grazing_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5973 (class 2606 OID 34954)
-- Name: pasture_nutrients pasture_nutrients_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_nutrients
    ADD CONSTRAINT pasture_nutrients_pkey PRIMARY KEY (id);


--
-- TOC entry 5970 (class 2606 OID 34933)
-- Name: pasture_soil_samples pasture_soil_samples_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_soil_samples
    ADD CONSTRAINT pasture_soil_samples_pkey PRIMARY KEY (id);


--
-- TOC entry 5978 (class 2606 OID 34978)
-- Name: pasture_tasks pasture_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_tasks
    ADD CONSTRAINT pasture_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 5982 (class 2606 OID 35003)
-- Name: pasture_treatments pasture_treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_treatments
    ADD CONSTRAINT pasture_treatments_pkey PRIMARY KEY (id);


--
-- TOC entry 5932 (class 2606 OID 34732)
-- Name: pastures pastures_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pastures
    ADD CONSTRAINT pastures_pkey PRIMARY KEY (id);


--
-- TOC entry 5934 (class 2606 OID 34734)
-- Name: pastures pastures_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pastures
    ADD CONSTRAINT pastures_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 5763 (class 2606 OID 33534)
-- Name: plaid_accounts plaid_accounts_account_id_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.plaid_accounts
    ADD CONSTRAINT plaid_accounts_account_id_key UNIQUE (account_id);


--
-- TOC entry 5765 (class 2606 OID 33476)
-- Name: plaid_accounts plaid_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.plaid_accounts
    ADD CONSTRAINT plaid_accounts_pkey PRIMARY KEY (id);


--
-- TOC entry 5759 (class 2606 OID 33496)
-- Name: plaid_items plaid_items_item_id_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.plaid_items
    ADD CONSTRAINT plaid_items_item_id_key UNIQUE (item_id);


--
-- TOC entry 5761 (class 2606 OID 33467)
-- Name: plaid_items plaid_items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.plaid_items
    ADD CONSTRAINT plaid_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5840 (class 2606 OID 34209)
-- Name: pos_order_items pos_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5834 (class 2606 OID 34189)
-- Name: pos_orders pos_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5836 (class 2606 OID 34191)
-- Name: pos_orders pos_orders_tenant_id_order_number_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_tenant_id_order_number_key UNIQUE (tenant_id, order_number);


--
-- TOC entry 6016 (class 2606 OID 35300)
-- Name: processing_records processing_records_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.processing_records
    ADD CONSTRAINT processing_records_pkey PRIMARY KEY (id);


--
-- TOC entry 6020 (class 2606 OID 35353)
-- Name: rainfall_records rainfall_records_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.rainfall_records
    ADD CONSTRAINT rainfall_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5754 (class 2606 OID 33433)
-- Name: report_configurations report_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.report_configurations
    ADD CONSTRAINT report_configurations_pkey PRIMARY KEY (id);


--
-- TOC entry 5756 (class 2606 OID 33435)
-- Name: report_configurations report_configurations_report_type_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.report_configurations
    ADD CONSTRAINT report_configurations_report_type_name_key UNIQUE (report_type, name);


--
-- TOC entry 5856 (class 2606 OID 34293)
-- Name: restaurant_order_items restaurant_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_order_items
    ADD CONSTRAINT restaurant_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5848 (class 2606 OID 34259)
-- Name: restaurant_orders restaurant_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5850 (class 2606 OID 34261)
-- Name: restaurant_orders restaurant_orders_tenant_id_order_number_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_tenant_id_order_number_key UNIQUE (tenant_id, order_number);


--
-- TOC entry 6002 (class 2606 OID 35170)
-- Name: sale_fee_types sale_fee_types_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_fee_types
    ADD CONSTRAINT sale_fee_types_pkey PRIMARY KEY (id);


--
-- TOC entry 6004 (class 2606 OID 35172)
-- Name: sale_fee_types sale_fee_types_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_fee_types
    ADD CONSTRAINT sale_fee_types_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 6000 (class 2606 OID 35145)
-- Name: sale_ticket_fees sale_ticket_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_fees
    ADD CONSTRAINT sale_ticket_fees_pkey PRIMARY KEY (id);


--
-- TOC entry 5997 (class 2606 OID 35117)
-- Name: sale_ticket_items sale_ticket_items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_items
    ADD CONSTRAINT sale_ticket_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5993 (class 2606 OID 35097)
-- Name: sale_tickets sale_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_tickets
    ADD CONSTRAINT sale_tickets_pkey PRIMARY KEY (id);


--
-- TOC entry 5906 (class 2606 OID 34576)
-- Name: site_pages site_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.site_pages
    ADD CONSTRAINT site_pages_pkey PRIMARY KEY (id);


--
-- TOC entry 5908 (class 2606 OID 34578)
-- Name: site_pages site_pages_tenant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.site_pages
    ADD CONSTRAINT site_pages_tenant_id_slug_key UNIQUE (tenant_id, slug);


--
-- TOC entry 5890 (class 2606 OID 34519)
-- Name: site_themes site_themes_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.site_themes
    ADD CONSTRAINT site_themes_pkey PRIMARY KEY (id);


--
-- TOC entry 5892 (class 2606 OID 34521)
-- Name: site_themes site_themes_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.site_themes
    ADD CONSTRAINT site_themes_slug_key UNIQUE (slug);


--
-- TOC entry 5874 (class 2606 OID 34433)
-- Name: social_connections social_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_pkey PRIMARY KEY (id);


--
-- TOC entry 5876 (class 2606 OID 34435)
-- Name: social_connections social_connections_tenant_id_platform_id_account_id_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_tenant_id_platform_id_account_id_key UNIQUE (tenant_id, platform_id, account_id);


--
-- TOC entry 5869 (class 2606 OID 34421)
-- Name: social_platforms social_platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_platforms
    ADD CONSTRAINT social_platforms_pkey PRIMARY KEY (id);


--
-- TOC entry 5886 (class 2606 OID 34480)
-- Name: social_post_platforms social_post_platforms_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_post_platforms
    ADD CONSTRAINT social_post_platforms_pkey PRIMARY KEY (id);


--
-- TOC entry 5888 (class 2606 OID 34482)
-- Name: social_post_platforms social_post_platforms_social_post_id_connection_id_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_post_platforms
    ADD CONSTRAINT social_post_platforms_social_post_id_connection_id_key UNIQUE (social_post_id, connection_id);


--
-- TOC entry 5882 (class 2606 OID 34454)
-- Name: social_posts social_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5656 (class 2606 OID 32906)
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- TOC entry 5658 (class 2606 OID 32904)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5660 (class 2606 OID 32908)
-- Name: tags tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);


--
-- TOC entry 5900 (class 2606 OID 34556)
-- Name: tenant_site_settings tenant_site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tenant_site_settings
    ADD CONSTRAINT tenant_site_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5902 (class 2606 OID 34558)
-- Name: tenant_site_settings tenant_site_settings_tenant_id_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tenant_site_settings
    ADD CONSTRAINT tenant_site_settings_tenant_id_key UNIQUE (tenant_id);


--
-- TOC entry 5780 (class 2606 OID 33610)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 5782 (class 2606 OID 33612)
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- TOC entry 5896 (class 2606 OID 34533)
-- Name: theme_sections theme_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.theme_sections
    ADD CONSTRAINT theme_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5898 (class 2606 OID 34535)
-- Name: theme_sections theme_sections_theme_id_page_type_section_type_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.theme_sections
    ADD CONSTRAINT theme_sections_theme_id_page_type_section_type_key UNIQUE (theme_id, page_type, section_type);


--
-- TOC entry 5721 (class 2606 OID 33167)
-- Name: trailer_order_items trailer_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.trailer_order_items
    ADD CONSTRAINT trailer_order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5717 (class 2606 OID 33157)
-- Name: trailer_orders trailer_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.trailer_orders
    ADD CONSTRAINT trailer_orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 5719 (class 2606 OID 33155)
-- Name: trailer_orders trailer_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.trailer_orders
    ADD CONSTRAINT trailer_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5689 (class 2606 OID 33010)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5691 (class 2606 OID 33509)
-- Name: transactions transactions_plaid_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_plaid_transaction_id_key UNIQUE (plaid_transaction_id);


--
-- TOC entry 6025 (class 2606 OID 35374)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 6027 (class 2606 OID 35376)
-- Name: vendors vendors_tenant_name_unique; Type: CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_tenant_name_unique UNIQUE (tenant_id, name);


--
-- TOC entry 5731 (class 1259 OID 33306)
-- Name: idx_accounts_chart_code; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_chart_code ON public.accounts_chart USING btree (account_code);


--
-- TOC entry 5732 (class 1259 OID 33308)
-- Name: idx_accounts_chart_parent; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_chart_parent ON public.accounts_chart USING btree (parent_id);


--
-- TOC entry 5733 (class 1259 OID 35404)
-- Name: idx_accounts_chart_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_chart_tenant ON public.accounts_chart USING btree (tenant_id);


--
-- TOC entry 5734 (class 1259 OID 33307)
-- Name: idx_accounts_chart_type; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_chart_type ON public.accounts_chart USING btree (account_type);


--
-- TOC entry 5643 (class 1259 OID 32876)
-- Name: idx_accounts_email; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_email ON public.accounts USING btree (email);


--
-- TOC entry 5644 (class 1259 OID 32878)
-- Name: idx_accounts_farm_member; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_farm_member ON public.accounts USING btree (is_farm_member);


--
-- TOC entry 5645 (class 1259 OID 32877)
-- Name: idx_accounts_role; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_role ON public.accounts USING btree (role);


--
-- TOC entry 5646 (class 1259 OID 33645)
-- Name: idx_accounts_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_tenant ON public.accounts USING btree (tenant_id);


--
-- TOC entry 5647 (class 1259 OID 32879)
-- Name: idx_accounts_zone; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_accounts_zone ON public.accounts USING btree (delivery_zone_id);


--
-- TOC entry 5957 (class 1259 OID 34872)
-- Name: idx_animal_health_animal; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animal_health_animal ON public.animal_health_records USING btree (animal_id);


--
-- TOC entry 5958 (class 1259 OID 34871)
-- Name: idx_animal_health_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animal_health_tenant ON public.animal_health_records USING btree (tenant_id);


--
-- TOC entry 5948 (class 1259 OID 34825)
-- Name: idx_animal_sales_animal; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animal_sales_animal ON public.animal_sales USING btree (animal_id);


--
-- TOC entry 5949 (class 1259 OID 34826)
-- Name: idx_animal_sales_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animal_sales_date ON public.animal_sales USING btree (sale_date);


--
-- TOC entry 5950 (class 1259 OID 34824)
-- Name: idx_animal_sales_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animal_sales_tenant ON public.animal_sales USING btree (tenant_id);


--
-- TOC entry 5953 (class 1259 OID 34849)
-- Name: idx_animal_weights_animal; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animal_weights_animal ON public.animal_weights USING btree (animal_id);


--
-- TOC entry 5954 (class 1259 OID 34848)
-- Name: idx_animal_weights_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animal_weights_tenant ON public.animal_weights USING btree (tenant_id);


--
-- TOC entry 5937 (class 1259 OID 34798)
-- Name: idx_animals_category; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_category ON public.animals USING btree (category_id);


--
-- TOC entry 5938 (class 1259 OID 34799)
-- Name: idx_animals_dam; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_dam ON public.animals USING btree (dam_id);


--
-- TOC entry 5939 (class 1259 OID 34795)
-- Name: idx_animals_ear_tag; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_ear_tag ON public.animals USING btree (tenant_id, ear_tag);


--
-- TOC entry 5940 (class 1259 OID 35081)
-- Name: idx_animals_herd; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_herd ON public.animals USING btree (herd_id);


--
-- TOC entry 5941 (class 1259 OID 34801)
-- Name: idx_animals_pasture; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_pasture ON public.animals USING btree (current_pasture_id);


--
-- TOC entry 5942 (class 1259 OID 34800)
-- Name: idx_animals_sire; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_sire ON public.animals USING btree (sire_id);


--
-- TOC entry 5943 (class 1259 OID 34796)
-- Name: idx_animals_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_status ON public.animals USING btree (tenant_id, status);


--
-- TOC entry 5944 (class 1259 OID 34794)
-- Name: idx_animals_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_tenant ON public.animals USING btree (tenant_id);


--
-- TOC entry 5945 (class 1259 OID 34797)
-- Name: idx_animals_type; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_animals_type ON public.animals USING btree (animal_type_id);


--
-- TOC entry 5724 (class 1259 OID 33194)
-- Name: idx_audit_log_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_audit_log_date ON public.audit_log USING btree (changed_at);


--
-- TOC entry 5725 (class 1259 OID 33193)
-- Name: idx_audit_log_record; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_audit_log_record ON public.audit_log USING btree (record_id);


--
-- TOC entry 5726 (class 1259 OID 33192)
-- Name: idx_audit_log_table; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_audit_log_table ON public.audit_log USING btree (table_name);


--
-- TOC entry 5682 (class 1259 OID 35432)
-- Name: idx_bank_accounts_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_bank_accounts_tenant ON public.bank_accounts USING btree (tenant_id);


--
-- TOC entry 5772 (class 1259 OID 33590)
-- Name: idx_blog_posts_author; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_blog_posts_author ON public.blog_posts USING btree (author_id);


--
-- TOC entry 5773 (class 1259 OID 33589)
-- Name: idx_blog_posts_published_at; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_blog_posts_published_at ON public.blog_posts USING btree (published_at DESC);


--
-- TOC entry 5774 (class 1259 OID 33587)
-- Name: idx_blog_posts_slug; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_blog_posts_slug ON public.blog_posts USING btree (slug);


--
-- TOC entry 5775 (class 1259 OID 33588)
-- Name: idx_blog_posts_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_blog_posts_status ON public.blog_posts USING btree (status);


--
-- TOC entry 5776 (class 1259 OID 33648)
-- Name: idx_blog_posts_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_blog_posts_tenant ON public.blog_posts USING btree (tenant_id);


--
-- TOC entry 6009 (class 1259 OID 35198)
-- Name: idx_buyers_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_buyers_tenant ON public.buyers USING btree (tenant_id);


--
-- TOC entry 5654 (class 1259 OID 33647)
-- Name: idx_categories_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_categories_tenant ON public.categories USING btree (tenant_id);


--
-- TOC entry 5826 (class 1259 OID 34172)
-- Name: idx_event_series_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_event_series_tenant ON public.event_series USING btree (tenant_id);


--
-- TOC entry 5818 (class 1259 OID 34167)
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date);


--
-- TOC entry 5819 (class 1259 OID 34170)
-- Name: idx_events_menu; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_events_menu ON public.events USING btree (menu_id);


--
-- TOC entry 5820 (class 1259 OID 34171)
-- Name: idx_events_series; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_events_series ON public.events USING btree (series_id);


--
-- TOC entry 5821 (class 1259 OID 34168)
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- TOC entry 5822 (class 1259 OID 34166)
-- Name: idx_events_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_events_tenant ON public.events USING btree (tenant_id);


--
-- TOC entry 5823 (class 1259 OID 34169)
-- Name: idx_events_tenant_date_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_events_tenant_date_status ON public.events USING btree (tenant_id, event_date, status);


--
-- TOC entry 5737 (class 1259 OID 35425)
-- Name: idx_fiscal_periods_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_fiscal_periods_tenant ON public.fiscal_periods USING btree (tenant_id);


--
-- TOC entry 5959 (class 1259 OID 34896)
-- Name: idx_grazing_events_pasture; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_grazing_events_pasture ON public.pasture_grazing_events USING btree (pasture_id);


--
-- TOC entry 5960 (class 1259 OID 34895)
-- Name: idx_grazing_events_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_grazing_events_tenant ON public.pasture_grazing_events USING btree (tenant_id);


--
-- TOC entry 5987 (class 1259 OID 35075)
-- Name: idx_herds_flocks_pasture; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_herds_flocks_pasture ON public.herds_flocks USING btree (current_pasture_id);


--
-- TOC entry 5988 (class 1259 OID 35073)
-- Name: idx_herds_flocks_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_herds_flocks_tenant ON public.herds_flocks USING btree (tenant_id);


--
-- TOC entry 5705 (class 1259 OID 33110)
-- Name: idx_inventory_logs_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_inventory_logs_date ON public.inventory_logs USING btree (created_at);


--
-- TOC entry 5706 (class 1259 OID 33109)
-- Name: idx_inventory_logs_item; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_inventory_logs_item ON public.inventory_logs USING btree (item_id);


--
-- TOC entry 5661 (class 1259 OID 32938)
-- Name: idx_items_active; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_items_active ON public.items USING btree (is_active);


--
-- TOC entry 5662 (class 1259 OID 32936)
-- Name: idx_items_category; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_items_category ON public.items USING btree (category_id);


--
-- TOC entry 5663 (class 1259 OID 32935)
-- Name: idx_items_sku; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_items_sku ON public.items USING btree (sku);


--
-- TOC entry 5664 (class 1259 OID 33564)
-- Name: idx_items_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_items_status ON public.items USING btree (status);


--
-- TOC entry 5665 (class 1259 OID 33566)
-- Name: idx_items_stripe_price; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_items_stripe_price ON public.items USING btree (stripe_price_id);


--
-- TOC entry 5666 (class 1259 OID 33565)
-- Name: idx_items_stripe_product; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_items_stripe_product ON public.items USING btree (stripe_product_id);


--
-- TOC entry 5667 (class 1259 OID 33646)
-- Name: idx_items_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_items_tenant ON public.items USING btree (tenant_id);


--
-- TOC entry 5668 (class 1259 OID 32937)
-- Name: idx_items_type; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_items_type ON public.items USING btree (item_type);


--
-- TOC entry 5738 (class 1259 OID 33359)
-- Name: idx_journal_entries_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_journal_entries_date ON public.journal_entries USING btree (entry_date);


--
-- TOC entry 5739 (class 1259 OID 33361)
-- Name: idx_journal_entries_number; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_journal_entries_number ON public.journal_entries USING btree (entry_number);


--
-- TOC entry 5740 (class 1259 OID 33547)
-- Name: idx_journal_entries_source; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_journal_entries_source ON public.journal_entries USING btree (source, source_id);


--
-- TOC entry 5741 (class 1259 OID 33360)
-- Name: idx_journal_entries_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_journal_entries_status ON public.journal_entries USING btree (status);


--
-- TOC entry 5742 (class 1259 OID 35418)
-- Name: idx_journal_entries_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_journal_entries_tenant ON public.journal_entries USING btree (tenant_id);


--
-- TOC entry 5747 (class 1259 OID 33553)
-- Name: idx_journal_entry_lines_class; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_journal_entry_lines_class ON public.journal_entry_lines USING btree (class_id);


--
-- TOC entry 5748 (class 1259 OID 33385)
-- Name: idx_journal_lines_account; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_journal_lines_account ON public.journal_entry_lines USING btree (account_id);


--
-- TOC entry 5749 (class 1259 OID 33384)
-- Name: idx_journal_lines_entry; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_journal_lines_entry ON public.journal_entry_lines USING btree (journal_entry_id);


--
-- TOC entry 5791 (class 1259 OID 33987)
-- Name: idx_media_created; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_media_created ON public.media USING btree (created_at DESC);


--
-- TOC entry 5792 (class 1259 OID 33984)
-- Name: idx_media_folder; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_media_folder ON public.media USING btree (tenant_id, folder);


--
-- TOC entry 5798 (class 1259 OID 33989)
-- Name: idx_media_folders_parent; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_media_folders_parent ON public.media_folders USING btree (parent_id);


--
-- TOC entry 5799 (class 1259 OID 33988)
-- Name: idx_media_folders_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_media_folders_tenant ON public.media_folders USING btree (tenant_id);


--
-- TOC entry 5793 (class 1259 OID 33986)
-- Name: idx_media_mime; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_media_mime ON public.media USING btree (mime_type);


--
-- TOC entry 5794 (class 1259 OID 33985)
-- Name: idx_media_tags; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_media_tags ON public.media USING gin (tags);


--
-- TOC entry 5795 (class 1259 OID 33983)
-- Name: idx_media_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_media_tenant ON public.media USING btree (tenant_id);


--
-- TOC entry 5675 (class 1259 OID 32977)
-- Name: idx_memberships_account; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_memberships_account ON public.memberships USING btree (account_id);


--
-- TOC entry 5676 (class 1259 OID 32979)
-- Name: idx_memberships_dates; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_memberships_dates ON public.memberships USING btree (start_date, end_date);


--
-- TOC entry 5677 (class 1259 OID 32978)
-- Name: idx_memberships_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_memberships_status ON public.memberships USING btree (status);


--
-- TOC entry 5862 (class 1259 OID 34402)
-- Name: idx_menu_item_modifications_item; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_item_modifications_item ON public.menu_item_modifications USING btree (tenant_id, menu_item_id);


--
-- TOC entry 5863 (class 1259 OID 34401)
-- Name: idx_menu_item_modifications_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_item_modifications_tenant ON public.menu_item_modifications USING btree (tenant_id);


--
-- TOC entry 5709 (class 1259 OID 34174)
-- Name: idx_menu_items_stripe_price; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_items_stripe_price ON public.menu_items USING btree (stripe_price_id) WHERE (stripe_price_id IS NOT NULL);


--
-- TOC entry 5710 (class 1259 OID 34173)
-- Name: idx_menu_items_stripe_product; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_items_stripe_product ON public.menu_items USING btree (stripe_product_id) WHERE (stripe_product_id IS NOT NULL);


--
-- TOC entry 5711 (class 1259 OID 34101)
-- Name: idx_menu_items_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_items_tenant ON public.menu_items USING btree (tenant_id);


--
-- TOC entry 5808 (class 1259 OID 34105)
-- Name: idx_menu_section_items_order; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_section_items_order ON public.menu_section_items USING btree (section_id, sort_order);


--
-- TOC entry 5809 (class 1259 OID 34104)
-- Name: idx_menu_section_items_section; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_section_items_section ON public.menu_section_items USING btree (section_id);


--
-- TOC entry 5804 (class 1259 OID 34102)
-- Name: idx_menu_sections_menu; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_sections_menu ON public.menu_sections USING btree (menu_id);


--
-- TOC entry 5805 (class 1259 OID 34103)
-- Name: idx_menu_sections_order; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menu_sections_order ON public.menu_sections USING btree (menu_id, sort_order);


--
-- TOC entry 5783 (class 1259 OID 33867)
-- Name: idx_menus_featured; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menus_featured ON public.menus USING btree (is_featured) WHERE (is_featured = true);


--
-- TOC entry 5784 (class 1259 OID 33865)
-- Name: idx_menus_slug; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menus_slug ON public.menus USING btree (tenant_id, slug);


--
-- TOC entry 5785 (class 1259 OID 33866)
-- Name: idx_menus_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menus_status ON public.menus USING btree (status);


--
-- TOC entry 5786 (class 1259 OID 33864)
-- Name: idx_menus_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_menus_tenant ON public.menus USING btree (tenant_id);


--
-- TOC entry 5857 (class 1259 OID 34404)
-- Name: idx_modifications_active; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_modifications_active ON public.modifications USING btree (tenant_id, is_active);


--
-- TOC entry 5858 (class 1259 OID 34403)
-- Name: idx_modifications_category; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_modifications_category ON public.modifications USING btree (tenant_id, category);


--
-- TOC entry 5859 (class 1259 OID 34400)
-- Name: idx_modifications_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_modifications_tenant ON public.modifications USING btree (tenant_id);


--
-- TOC entry 5971 (class 1259 OID 34965)
-- Name: idx_nutrients_sample; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_nutrients_sample ON public.pasture_nutrients USING btree (soil_sample_id);


--
-- TOC entry 5701 (class 1259 OID 33089)
-- Name: idx_order_items_item; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_order_items_item ON public.order_items USING btree (item_id);


--
-- TOC entry 5702 (class 1259 OID 33088)
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- TOC entry 5692 (class 1259 OID 33062)
-- Name: idx_orders_account; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_orders_account ON public.orders USING btree (account_id);


--
-- TOC entry 5693 (class 1259 OID 33064)
-- Name: idx_orders_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_orders_date ON public.orders USING btree (ordered_at);


--
-- TOC entry 5694 (class 1259 OID 33061)
-- Name: idx_orders_number; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_orders_number ON public.orders USING btree (order_number);


--
-- TOC entry 5695 (class 1259 OID 33063)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 5696 (class 1259 OID 35439)
-- Name: idx_orders_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_orders_tenant ON public.orders USING btree (tenant_id);


--
-- TOC entry 5909 (class 1259 OID 34603)
-- Name: idx_page_sections_page; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_page_sections_page ON public.page_sections USING btree (page_id);


--
-- TOC entry 5974 (class 1259 OID 34991)
-- Name: idx_pasture_tasks_completed; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pasture_tasks_completed ON public.pasture_tasks USING btree (is_completed);


--
-- TOC entry 5975 (class 1259 OID 34990)
-- Name: idx_pasture_tasks_pasture; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pasture_tasks_pasture ON public.pasture_tasks USING btree (pasture_id);


--
-- TOC entry 5976 (class 1259 OID 34989)
-- Name: idx_pasture_tasks_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pasture_tasks_tenant ON public.pasture_tasks USING btree (tenant_id);


--
-- TOC entry 5930 (class 1259 OID 34740)
-- Name: idx_pastures_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pastures_tenant ON public.pastures USING btree (tenant_id);


--
-- TOC entry 5757 (class 1259 OID 33497)
-- Name: idx_plaid_items_item_id; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_plaid_items_item_id ON public.plaid_items USING btree (item_id);


--
-- TOC entry 5837 (class 1259 OID 34227)
-- Name: idx_pos_order_items_item; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pos_order_items_item ON public.pos_order_items USING btree (item_id) WHERE (item_id IS NOT NULL);


--
-- TOC entry 5838 (class 1259 OID 34226)
-- Name: idx_pos_order_items_order; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pos_order_items_order ON public.pos_order_items USING btree (order_id);


--
-- TOC entry 5827 (class 1259 OID 34222)
-- Name: idx_pos_orders_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pos_orders_date ON public.pos_orders USING btree (created_at);


--
-- TOC entry 5828 (class 1259 OID 34221)
-- Name: idx_pos_orders_number; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pos_orders_number ON public.pos_orders USING btree (order_number);


--
-- TOC entry 5829 (class 1259 OID 34224)
-- Name: idx_pos_orders_payment; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pos_orders_payment ON public.pos_orders USING btree (payment_method);


--
-- TOC entry 5830 (class 1259 OID 34225)
-- Name: idx_pos_orders_payment_intent; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pos_orders_payment_intent ON public.pos_orders USING btree (payment_intent_id) WHERE (payment_intent_id IS NOT NULL);


--
-- TOC entry 5831 (class 1259 OID 34223)
-- Name: idx_pos_orders_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pos_orders_status ON public.pos_orders USING btree (status);


--
-- TOC entry 5832 (class 1259 OID 34220)
-- Name: idx_pos_orders_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_pos_orders_tenant ON public.pos_orders USING btree (tenant_id);


--
-- TOC entry 6010 (class 1259 OID 35317)
-- Name: idx_processing_records_animal; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_processing_records_animal ON public.processing_records USING btree (animal_id);


--
-- TOC entry 6011 (class 1259 OID 35320)
-- Name: idx_processing_records_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_processing_records_date ON public.processing_records USING btree (processing_date);


--
-- TOC entry 6012 (class 1259 OID 35318)
-- Name: idx_processing_records_herd; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_processing_records_herd ON public.processing_records USING btree (herd_id);


--
-- TOC entry 6013 (class 1259 OID 35319)
-- Name: idx_processing_records_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_processing_records_status ON public.processing_records USING btree (status);


--
-- TOC entry 6014 (class 1259 OID 35316)
-- Name: idx_processing_records_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_processing_records_tenant ON public.processing_records USING btree (tenant_id);


--
-- TOC entry 6017 (class 1259 OID 35359)
-- Name: idx_rainfall_tenant_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_rainfall_tenant_date ON public.rainfall_records USING btree (tenant_id, record_date);


--
-- TOC entry 6018 (class 1259 OID 35360)
-- Name: idx_rainfall_year; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_rainfall_year ON public.rainfall_records USING btree (tenant_id, EXTRACT(year FROM record_date));


--
-- TOC entry 5752 (class 1259 OID 33441)
-- Name: idx_report_config_type; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_report_config_type ON public.report_configurations USING btree (report_type);


--
-- TOC entry 5851 (class 1259 OID 34311)
-- Name: idx_restaurant_order_items_menu_item; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_order_items_menu_item ON public.restaurant_order_items USING btree (menu_item_id);


--
-- TOC entry 5852 (class 1259 OID 34310)
-- Name: idx_restaurant_order_items_order; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_order_items_order ON public.restaurant_order_items USING btree (order_id);


--
-- TOC entry 5853 (class 1259 OID 34319)
-- Name: idx_restaurant_order_items_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_order_items_tenant ON public.restaurant_order_items USING btree (tenant_id);


--
-- TOC entry 5854 (class 1259 OID 34320)
-- Name: idx_restaurant_order_items_tenant_order; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_order_items_tenant_order ON public.restaurant_order_items USING btree (tenant_id, order_id);


--
-- TOC entry 5841 (class 1259 OID 34308)
-- Name: idx_restaurant_orders_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_orders_date ON public.restaurant_orders USING btree (created_at);


--
-- TOC entry 5842 (class 1259 OID 34309)
-- Name: idx_restaurant_orders_menu; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_orders_menu ON public.restaurant_orders USING btree (menu_id);


--
-- TOC entry 5843 (class 1259 OID 34305)
-- Name: idx_restaurant_orders_number; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_orders_number ON public.restaurant_orders USING btree (order_number);


--
-- TOC entry 5844 (class 1259 OID 34307)
-- Name: idx_restaurant_orders_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_orders_status ON public.restaurant_orders USING btree (status);


--
-- TOC entry 5845 (class 1259 OID 34304)
-- Name: idx_restaurant_orders_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_orders_tenant ON public.restaurant_orders USING btree (tenant_id);


--
-- TOC entry 5846 (class 1259 OID 34306)
-- Name: idx_restaurant_orders_ticket; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_restaurant_orders_ticket ON public.restaurant_orders USING btree (ticket_number);


--
-- TOC entry 5998 (class 1259 OID 35156)
-- Name: idx_sale_ticket_fees_ticket; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_sale_ticket_fees_ticket ON public.sale_ticket_fees USING btree (sale_ticket_id);


--
-- TOC entry 5994 (class 1259 OID 35134)
-- Name: idx_sale_ticket_items_animal; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_sale_ticket_items_animal ON public.sale_ticket_items USING btree (animal_id);


--
-- TOC entry 5995 (class 1259 OID 35133)
-- Name: idx_sale_ticket_items_ticket; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_sale_ticket_items_ticket ON public.sale_ticket_items USING btree (sale_ticket_id);


--
-- TOC entry 5989 (class 1259 OID 35104)
-- Name: idx_sale_tickets_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_sale_tickets_date ON public.sale_tickets USING btree (sale_date);


--
-- TOC entry 5990 (class 1259 OID 35105)
-- Name: idx_sale_tickets_sold_to; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_sale_tickets_sold_to ON public.sale_tickets USING btree (sold_to);


--
-- TOC entry 5991 (class 1259 OID 35103)
-- Name: idx_sale_tickets_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_sale_tickets_tenant ON public.sale_tickets USING btree (tenant_id);


--
-- TOC entry 5903 (class 1259 OID 34602)
-- Name: idx_site_pages_slug; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_site_pages_slug ON public.site_pages USING btree (tenant_id, slug);


--
-- TOC entry 5904 (class 1259 OID 34601)
-- Name: idx_site_pages_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_site_pages_tenant ON public.site_pages USING btree (tenant_id);


--
-- TOC entry 5870 (class 1259 OID 34494)
-- Name: idx_social_connections_platform; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_connections_platform ON public.social_connections USING btree (platform_id);


--
-- TOC entry 5871 (class 1259 OID 34495)
-- Name: idx_social_connections_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_connections_status ON public.social_connections USING btree (status);


--
-- TOC entry 5872 (class 1259 OID 34493)
-- Name: idx_social_connections_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_connections_tenant ON public.social_connections USING btree (tenant_id);


--
-- TOC entry 5883 (class 1259 OID 34501)
-- Name: idx_social_post_platforms_connection; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_post_platforms_connection ON public.social_post_platforms USING btree (connection_id);


--
-- TOC entry 5884 (class 1259 OID 34500)
-- Name: idx_social_post_platforms_post; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_post_platforms_post ON public.social_post_platforms USING btree (social_post_id);


--
-- TOC entry 5877 (class 1259 OID 34499)
-- Name: idx_social_posts_blog; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_posts_blog ON public.social_posts USING btree (blog_post_id) WHERE (blog_post_id IS NOT NULL);


--
-- TOC entry 5878 (class 1259 OID 34498)
-- Name: idx_social_posts_scheduled; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_posts_scheduled ON public.social_posts USING btree (scheduled_for) WHERE ((status)::text = 'scheduled'::text);


--
-- TOC entry 5879 (class 1259 OID 34497)
-- Name: idx_social_posts_status; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_posts_status ON public.social_posts USING btree (status);


--
-- TOC entry 5880 (class 1259 OID 34496)
-- Name: idx_social_posts_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_social_posts_tenant ON public.social_posts USING btree (tenant_id);


--
-- TOC entry 5967 (class 1259 OID 34945)
-- Name: idx_soil_samples_pasture; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_soil_samples_pasture ON public.pasture_soil_samples USING btree (pasture_id);


--
-- TOC entry 5968 (class 1259 OID 34944)
-- Name: idx_soil_samples_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_soil_samples_tenant ON public.pasture_soil_samples USING btree (tenant_id);


--
-- TOC entry 5777 (class 1259 OID 33644)
-- Name: idx_tenants_domain; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_tenants_domain ON public.tenants USING btree (domain);


--
-- TOC entry 5778 (class 1259 OID 33643)
-- Name: idx_tenants_slug; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_tenants_slug ON public.tenants USING btree (slug);


--
-- TOC entry 5893 (class 1259 OID 34600)
-- Name: idx_theme_sections_page_type; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_theme_sections_page_type ON public.theme_sections USING btree (theme_id, page_type);


--
-- TOC entry 5894 (class 1259 OID 34599)
-- Name: idx_theme_sections_theme; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_theme_sections_theme ON public.theme_sections USING btree (theme_id);


--
-- TOC entry 5683 (class 1259 OID 33541)
-- Name: idx_transactions_accepted_gl_account; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_transactions_accepted_gl_account ON public.transactions USING btree (accepted_gl_account_id);


--
-- TOC entry 5684 (class 1259 OID 33026)
-- Name: idx_transactions_date; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_transactions_date ON public.transactions USING btree (date);


--
-- TOC entry 5685 (class 1259 OID 35411)
-- Name: idx_transactions_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_transactions_tenant ON public.transactions USING btree (tenant_id);


--
-- TOC entry 5686 (class 1259 OID 33027)
-- Name: idx_transactions_type; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);


--
-- TOC entry 5687 (class 1259 OID 35395)
-- Name: idx_transactions_vendor_id; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_transactions_vendor_id ON public.transactions USING btree (vendor_id);


--
-- TOC entry 5979 (class 1259 OID 35015)
-- Name: idx_treatments_pasture; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_treatments_pasture ON public.pasture_treatments USING btree (pasture_id);


--
-- TOC entry 5980 (class 1259 OID 35014)
-- Name: idx_treatments_tenant; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_treatments_tenant ON public.pasture_treatments USING btree (tenant_id);


--
-- TOC entry 6021 (class 1259 OID 35389)
-- Name: idx_vendors_is_active; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_vendors_is_active ON public.vendors USING btree (is_active);


--
-- TOC entry 6022 (class 1259 OID 35388)
-- Name: idx_vendors_name; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_vendors_name ON public.vendors USING btree (name);


--
-- TOC entry 6023 (class 1259 OID 35387)
-- Name: idx_vendors_tenant_id; Type: INDEX; Schema: public; Owner: robin
--

CREATE INDEX idx_vendors_tenant_id ON public.vendors USING btree (tenant_id);


--
-- TOC entry 6347 (class 2618 OID 33215)
-- Name: items_with_details _RETURN; Type: RULE; Schema: public; Owner: robin
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
-- TOC entry 6172 (class 2620 OID 33211)
-- Name: order_items inventory_update_on_order_item; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER inventory_update_on_order_item AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_order();


--
-- TOC entry 6188 (class 2620 OID 34614)
-- Name: page_sections page_sections_updated; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER page_sections_updated BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.update_site_designer_timestamp();


--
-- TOC entry 6176 (class 2620 OID 33388)
-- Name: journal_entries set_journal_entry_number; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER set_journal_entry_number BEFORE INSERT ON public.journal_entries FOR EACH ROW WHEN ((new.entry_number IS NULL)) EXECUTE FUNCTION public.generate_journal_entry_number();


--
-- TOC entry 6170 (class 2620 OID 33206)
-- Name: orders set_order_number; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW WHEN ((new.order_number IS NULL)) EXECUTE FUNCTION public.generate_order_number();


--
-- TOC entry 6174 (class 2620 OID 33209)
-- Name: trailer_orders set_trailer_order_number; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER set_trailer_order_number BEFORE INSERT ON public.trailer_orders FOR EACH ROW WHEN ((new.order_number IS NULL)) EXECUTE FUNCTION public.generate_trailer_order_number();


--
-- TOC entry 6187 (class 2620 OID 34613)
-- Name: site_pages site_pages_updated; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER site_pages_updated BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.update_site_designer_timestamp();


--
-- TOC entry 6185 (class 2620 OID 34611)
-- Name: site_themes site_themes_updated; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER site_themes_updated BEFORE UPDATE ON public.site_themes FOR EACH ROW EXECUTE FUNCTION public.update_site_designer_timestamp();


--
-- TOC entry 6182 (class 2620 OID 34504)
-- Name: social_connections social_connections_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER social_connections_updated_at BEFORE UPDATE ON public.social_connections FOR EACH ROW EXECUTE FUNCTION public.update_social_updated_at();


--
-- TOC entry 6181 (class 2620 OID 34503)
-- Name: social_platforms social_platforms_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER social_platforms_updated_at BEFORE UPDATE ON public.social_platforms FOR EACH ROW EXECUTE FUNCTION public.update_social_updated_at();


--
-- TOC entry 6184 (class 2620 OID 34506)
-- Name: social_post_platforms social_post_platforms_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER social_post_platforms_updated_at BEFORE UPDATE ON public.social_post_platforms FOR EACH ROW EXECUTE FUNCTION public.update_social_updated_at();


--
-- TOC entry 6183 (class 2620 OID 34505)
-- Name: social_posts social_posts_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER social_posts_updated_at BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION public.update_social_updated_at();


--
-- TOC entry 6186 (class 2620 OID 34612)
-- Name: tenant_site_settings tenant_site_settings_updated; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER tenant_site_settings_updated BEFORE UPDATE ON public.tenant_site_settings FOR EACH ROW EXECUTE FUNCTION public.update_site_designer_timestamp();


--
-- TOC entry 6175 (class 2620 OID 33393)
-- Name: accounts_chart update_accounts_chart_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_accounts_chart_updated_at BEFORE UPDATE ON public.accounts_chart FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6165 (class 2620 OID 33196)
-- Name: accounts update_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6191 (class 2620 OID 35033)
-- Name: animal_sales update_animal_sales_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_animal_sales_updated_at BEFORE UPDATE ON public.animal_sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6190 (class 2620 OID 35031)
-- Name: animals update_animals_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6177 (class 2620 OID 33392)
-- Name: journal_entries update_balances_on_post; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_balances_on_post AFTER UPDATE OF status ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_account_balances();


--
-- TOC entry 6200 (class 2620 OID 35211)
-- Name: buyers update_buyers_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON public.buyers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6166 (class 2620 OID 33202)
-- Name: categories update_categories_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6164 (class 2620 OID 33201)
-- Name: delivery_zones update_delivery_zones_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON public.delivery_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6192 (class 2620 OID 35034)
-- Name: pasture_grazing_events update_grazing_events_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_grazing_events_updated_at BEFORE UPDATE ON public.pasture_grazing_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6196 (class 2620 OID 35209)
-- Name: herds_flocks update_herds_flocks_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_herds_flocks_updated_at BEFORE UPDATE ON public.herds_flocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6167 (class 2620 OID 33197)
-- Name: items update_items_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6178 (class 2620 OID 33394)
-- Name: journal_entries update_journal_entries_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6179 (class 2620 OID 33390)
-- Name: journal_entry_lines update_journal_totals_on_line_change; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_journal_totals_on_line_change AFTER INSERT OR DELETE OR UPDATE ON public.journal_entry_lines FOR EACH ROW EXECUTE FUNCTION public.update_journal_totals();


--
-- TOC entry 6168 (class 2620 OID 33200)
-- Name: memberships update_memberships_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6173 (class 2620 OID 33203)
-- Name: menu_items update_menu_items_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6180 (class 2620 OID 34390)
-- Name: modifications update_modifications_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_modifications_updated_at BEFORE UPDATE ON public.modifications FOR EACH ROW EXECUTE FUNCTION public.update_modifications_timestamp();


--
-- TOC entry 6171 (class 2620 OID 33198)
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6194 (class 2620 OID 35035)
-- Name: pasture_tasks update_pasture_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_pasture_tasks_updated_at BEFORE UPDATE ON public.pasture_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6195 (class 2620 OID 35036)
-- Name: pasture_treatments update_pasture_treatments_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_pasture_treatments_updated_at BEFORE UPDATE ON public.pasture_treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6189 (class 2620 OID 35032)
-- Name: pastures update_pastures_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_pastures_updated_at BEFORE UPDATE ON public.pastures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6201 (class 2620 OID 35321)
-- Name: processing_records update_processing_records_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_processing_records_updated_at BEFORE UPDATE ON public.processing_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6197 (class 2620 OID 35210)
-- Name: sale_tickets update_sale_tickets_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_sale_tickets_updated_at BEFORE UPDATE ON public.sale_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6193 (class 2620 OID 35037)
-- Name: pasture_soil_samples update_soil_samples_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_soil_samples_updated_at BEFORE UPDATE ON public.pasture_soil_samples FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6199 (class 2620 OID 35214)
-- Name: sale_ticket_fees update_ticket_totals_on_fee_change; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_ticket_totals_on_fee_change AFTER INSERT OR DELETE OR UPDATE ON public.sale_ticket_fees FOR EACH ROW EXECUTE FUNCTION public.update_sale_ticket_totals();


--
-- TOC entry 6198 (class 2620 OID 35213)
-- Name: sale_ticket_items update_ticket_totals_on_item_change; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_ticket_totals_on_item_change AFTER INSERT OR DELETE OR UPDATE ON public.sale_ticket_items FOR EACH ROW EXECUTE FUNCTION public.update_sale_ticket_totals();


--
-- TOC entry 6169 (class 2620 OID 33199)
-- Name: transactions update_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: robin
--

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 6060 (class 2606 OID 33301)
-- Name: accounts_chart accounts_chart_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts_chart
    ADD CONSTRAINT accounts_chart_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.accounts_chart(id) ON DELETE SET NULL;


--
-- TOC entry 6061 (class 2606 OID 35399)
-- Name: accounts_chart accounts_chart_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts_chart
    ADD CONSTRAINT accounts_chart_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6028 (class 2606 OID 32871)
-- Name: accounts accounts_delivery_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_delivery_zone_id_fkey FOREIGN KEY (delivery_zone_id) REFERENCES public.delivery_zones(id) ON DELETE SET NULL;


--
-- TOC entry 6029 (class 2606 OID 33614)
-- Name: accounts accounts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6117 (class 2606 OID 34696)
-- Name: animal_categories animal_categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_categories
    ADD CONSTRAINT animal_categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6133 (class 2606 OID 34866)
-- Name: animal_health_records animal_health_records_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_health_records
    ADD CONSTRAINT animal_health_records_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- TOC entry 6134 (class 2606 OID 34861)
-- Name: animal_health_records animal_health_records_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_health_records
    ADD CONSTRAINT animal_health_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6118 (class 2606 OID 34715)
-- Name: animal_owners animal_owners_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_owners
    ADD CONSTRAINT animal_owners_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6129 (class 2606 OID 34819)
-- Name: animal_sales animal_sales_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_sales
    ADD CONSTRAINT animal_sales_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- TOC entry 6130 (class 2606 OID 34814)
-- Name: animal_sales animal_sales_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_sales
    ADD CONSTRAINT animal_sales_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6115 (class 2606 OID 34659)
-- Name: animal_types animal_types_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_types
    ADD CONSTRAINT animal_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6131 (class 2606 OID 34843)
-- Name: animal_weights animal_weights_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_weights
    ADD CONSTRAINT animal_weights_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- TOC entry 6132 (class 2606 OID 34838)
-- Name: animal_weights animal_weights_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animal_weights
    ADD CONSTRAINT animal_weights_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6120 (class 2606 OID 34759)
-- Name: animals animals_animal_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_animal_type_id_fkey FOREIGN KEY (animal_type_id) REFERENCES public.animal_types(id);


--
-- TOC entry 6121 (class 2606 OID 34769)
-- Name: animals animals_breed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_breed_id_fkey FOREIGN KEY (breed_id) REFERENCES public.breeds(id);


--
-- TOC entry 6122 (class 2606 OID 34764)
-- Name: animals animals_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.animal_categories(id);


--
-- TOC entry 6123 (class 2606 OID 34789)
-- Name: animals animals_current_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_current_pasture_id_fkey FOREIGN KEY (current_pasture_id) REFERENCES public.pastures(id) ON DELETE SET NULL;


--
-- TOC entry 6124 (class 2606 OID 34774)
-- Name: animals animals_dam_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_dam_id_fkey FOREIGN KEY (dam_id) REFERENCES public.animals(id) ON DELETE SET NULL;


--
-- TOC entry 6125 (class 2606 OID 35076)
-- Name: animals animals_herd_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_herd_id_fkey FOREIGN KEY (herd_id) REFERENCES public.herds_flocks(id) ON DELETE SET NULL;


--
-- TOC entry 6126 (class 2606 OID 34784)
-- Name: animals animals_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.animal_owners(id);


--
-- TOC entry 6127 (class 2606 OID 34779)
-- Name: animals animals_sire_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_sire_id_fkey FOREIGN KEY (sire_id) REFERENCES public.animals(id) ON DELETE SET NULL;


--
-- TOC entry 6128 (class 2606 OID 34754)
-- Name: animals animals_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.animals
    ADD CONSTRAINT animals_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6059 (class 2606 OID 33187)
-- Name: audit_log audit_log_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6038 (class 2606 OID 35427)
-- Name: bank_accounts bank_accounts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6075 (class 2606 OID 33582)
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6076 (class 2606 OID 33638)
-- Name: blog_posts blog_posts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6116 (class 2606 OID 34678)
-- Name: breeds breeds_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.breeds
    ADD CONSTRAINT breeds_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6157 (class 2606 OID 35193)
-- Name: buyers buyers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.buyers
    ADD CONSTRAINT buyers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6030 (class 2606 OID 33626)
-- Name: categories categories_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6092 (class 2606 OID 34156)
-- Name: event_series event_series_default_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.event_series
    ADD CONSTRAINT event_series_default_menu_id_fkey FOREIGN KEY (default_menu_id) REFERENCES public.menus(id);


--
-- TOC entry 6093 (class 2606 OID 34151)
-- Name: event_series event_series_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.event_series
    ADD CONSTRAINT event_series_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6088 (class 2606 OID 34133)
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 6089 (class 2606 OID 34128)
-- Name: events events_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id);


--
-- TOC entry 6090 (class 2606 OID 34161)
-- Name: events events_series_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_series_id_fkey FOREIGN KEY (series_id) REFERENCES public.event_series(id);


--
-- TOC entry 6091 (class 2606 OID 34123)
-- Name: events events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6062 (class 2606 OID 33318)
-- Name: fiscal_periods fiscal_periods_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6063 (class 2606 OID 35420)
-- Name: fiscal_periods fiscal_periods_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.fiscal_periods
    ADD CONSTRAINT fiscal_periods_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6137 (class 2606 OID 34917)
-- Name: grazing_event_animals grazing_event_animals_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE CASCADE;


--
-- TOC entry 6138 (class 2606 OID 34912)
-- Name: grazing_event_animals grazing_event_animals_grazing_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_grazing_event_id_fkey FOREIGN KEY (grazing_event_id) REFERENCES public.pasture_grazing_events(id) ON DELETE CASCADE;


--
-- TOC entry 6139 (class 2606 OID 34907)
-- Name: grazing_event_animals grazing_event_animals_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.grazing_event_animals
    ADD CONSTRAINT grazing_event_animals_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6148 (class 2606 OID 35068)
-- Name: herds_flocks herds_flocks_current_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.herds_flocks
    ADD CONSTRAINT herds_flocks_current_pasture_id_fkey FOREIGN KEY (current_pasture_id) REFERENCES public.pastures(id) ON DELETE SET NULL;


--
-- TOC entry 6149 (class 2606 OID 35063)
-- Name: herds_flocks herds_flocks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.herds_flocks
    ADD CONSTRAINT herds_flocks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6051 (class 2606 OID 33104)
-- Name: inventory_logs inventory_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6052 (class 2606 OID 33099)
-- Name: inventory_logs inventory_logs_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.inventory_logs
    ADD CONSTRAINT inventory_logs_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- TOC entry 6034 (class 2606 OID 32944)
-- Name: item_tags item_tags_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- TOC entry 6035 (class 2606 OID 32949)
-- Name: item_tags item_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.item_tags
    ADD CONSTRAINT item_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 6032 (class 2606 OID 32930)
-- Name: items items_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- TOC entry 6033 (class 2606 OID 33620)
-- Name: items items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6064 (class 2606 OID 33354)
-- Name: journal_entries journal_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6065 (class 2606 OID 33339)
-- Name: journal_entries journal_entries_fiscal_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_fiscal_period_id_fkey FOREIGN KEY (fiscal_period_id) REFERENCES public.fiscal_periods(id) ON DELETE RESTRICT;


--
-- TOC entry 6066 (class 2606 OID 33344)
-- Name: journal_entries journal_entries_posted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6067 (class 2606 OID 35413)
-- Name: journal_entries journal_entries_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6068 (class 2606 OID 33349)
-- Name: journal_entries journal_entries_voided_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_voided_by_fkey FOREIGN KEY (voided_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6069 (class 2606 OID 33379)
-- Name: journal_entry_lines journal_entry_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts_chart(id) ON DELETE RESTRICT;


--
-- TOC entry 6070 (class 2606 OID 33548)
-- Name: journal_entry_lines journal_entry_lines_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 6071 (class 2606 OID 33374)
-- Name: journal_entry_lines journal_entry_lines_journal_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.journal_entry_lines
    ADD CONSTRAINT journal_entry_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE;


--
-- TOC entry 6083 (class 2606 OID 33978)
-- Name: media_folders media_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media_folders(id);


--
-- TOC entry 6084 (class 2606 OID 33973)
-- Name: media_folders media_folders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.media_folders
    ADD CONSTRAINT media_folders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6080 (class 2606 OID 33951)
-- Name: media media_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media(id);


--
-- TOC entry 6081 (class 2606 OID 33946)
-- Name: media media_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6082 (class 2606 OID 33956)
-- Name: media media_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.accounts(id);


--
-- TOC entry 6036 (class 2606 OID 32967)
-- Name: memberships memberships_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- TOC entry 6037 (class 2606 OID 32972)
-- Name: memberships memberships_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- TOC entry 6055 (class 2606 OID 33135)
-- Name: menu_item_ingredients menu_item_ingredients_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_item_ingredients
    ADD CONSTRAINT menu_item_ingredients_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- TOC entry 6056 (class 2606 OID 33130)
-- Name: menu_item_ingredients menu_item_ingredients_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_item_ingredients
    ADD CONSTRAINT menu_item_ingredients_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 6105 (class 2606 OID 34376)
-- Name: menu_item_modifications menu_item_modifications_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_item_modifications
    ADD CONSTRAINT menu_item_modifications_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 6106 (class 2606 OID 34381)
-- Name: menu_item_modifications menu_item_modifications_modification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_item_modifications
    ADD CONSTRAINT menu_item_modifications_modification_id_fkey FOREIGN KEY (modification_id) REFERENCES public.modifications(id) ON DELETE CASCADE;


--
-- TOC entry 6053 (class 2606 OID 34006)
-- Name: menu_items menu_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- TOC entry 6054 (class 2606 OID 34055)
-- Name: menu_items menu_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6086 (class 2606 OID 34096)
-- Name: menu_section_items menu_section_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_section_items
    ADD CONSTRAINT menu_section_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE CASCADE;


--
-- TOC entry 6087 (class 2606 OID 34091)
-- Name: menu_section_items menu_section_items_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_section_items
    ADD CONSTRAINT menu_section_items_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.menu_sections(id) ON DELETE CASCADE;


--
-- TOC entry 6085 (class 2606 OID 34073)
-- Name: menu_sections menu_sections_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menu_sections
    ADD CONSTRAINT menu_sections_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE;


--
-- TOC entry 6077 (class 2606 OID 33859)
-- Name: menus menus_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 6078 (class 2606 OID 33854)
-- Name: menus menus_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.menus(id);


--
-- TOC entry 6079 (class 2606 OID 33849)
-- Name: menus menus_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6049 (class 2606 OID 33083)
-- Name: order_items order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE SET NULL;


--
-- TOC entry 6050 (class 2606 OID 33078)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 6046 (class 2606 OID 33051)
-- Name: orders orders_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6047 (class 2606 OID 33056)
-- Name: orders orders_delivery_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_delivery_zone_id_fkey FOREIGN KEY (delivery_zone_id) REFERENCES public.delivery_zones(id) ON DELETE SET NULL;


--
-- TOC entry 6048 (class 2606 OID 35434)
-- Name: orders orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6114 (class 2606 OID 34594)
-- Name: page_sections page_sections_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.page_sections
    ADD CONSTRAINT page_sections_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;


--
-- TOC entry 6135 (class 2606 OID 34890)
-- Name: pasture_grazing_events pasture_grazing_events_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_grazing_events
    ADD CONSTRAINT pasture_grazing_events_pasture_id_fkey FOREIGN KEY (pasture_id) REFERENCES public.pastures(id) ON DELETE CASCADE;


--
-- TOC entry 6136 (class 2606 OID 34885)
-- Name: pasture_grazing_events pasture_grazing_events_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_grazing_events
    ADD CONSTRAINT pasture_grazing_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6142 (class 2606 OID 34960)
-- Name: pasture_nutrients pasture_nutrients_soil_sample_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_nutrients
    ADD CONSTRAINT pasture_nutrients_soil_sample_id_fkey FOREIGN KEY (soil_sample_id) REFERENCES public.pasture_soil_samples(id) ON DELETE CASCADE;


--
-- TOC entry 6143 (class 2606 OID 34955)
-- Name: pasture_nutrients pasture_nutrients_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_nutrients
    ADD CONSTRAINT pasture_nutrients_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6140 (class 2606 OID 34939)
-- Name: pasture_soil_samples pasture_soil_samples_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_soil_samples
    ADD CONSTRAINT pasture_soil_samples_pasture_id_fkey FOREIGN KEY (pasture_id) REFERENCES public.pastures(id) ON DELETE CASCADE;


--
-- TOC entry 6141 (class 2606 OID 34934)
-- Name: pasture_soil_samples pasture_soil_samples_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_soil_samples
    ADD CONSTRAINT pasture_soil_samples_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6144 (class 2606 OID 34984)
-- Name: pasture_tasks pasture_tasks_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_tasks
    ADD CONSTRAINT pasture_tasks_pasture_id_fkey FOREIGN KEY (pasture_id) REFERENCES public.pastures(id) ON DELETE CASCADE;


--
-- TOC entry 6145 (class 2606 OID 34979)
-- Name: pasture_tasks pasture_tasks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_tasks
    ADD CONSTRAINT pasture_tasks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6146 (class 2606 OID 35009)
-- Name: pasture_treatments pasture_treatments_pasture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_treatments
    ADD CONSTRAINT pasture_treatments_pasture_id_fkey FOREIGN KEY (pasture_id) REFERENCES public.pastures(id) ON DELETE CASCADE;


--
-- TOC entry 6147 (class 2606 OID 35004)
-- Name: pasture_treatments pasture_treatments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pasture_treatments
    ADD CONSTRAINT pasture_treatments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6119 (class 2606 OID 34735)
-- Name: pastures pastures_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pastures
    ADD CONSTRAINT pastures_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6073 (class 2606 OID 33499)
-- Name: plaid_accounts plaid_accounts_linked_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.plaid_accounts
    ADD CONSTRAINT plaid_accounts_linked_account_id_fkey FOREIGN KEY (linked_account_id) REFERENCES public.accounts_chart(id);


--
-- TOC entry 6074 (class 2606 OID 33477)
-- Name: plaid_accounts plaid_accounts_plaid_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.plaid_accounts
    ADD CONSTRAINT plaid_accounts_plaid_item_id_fkey FOREIGN KEY (plaid_item_id) REFERENCES public.plaid_items(id);


--
-- TOC entry 6096 (class 2606 OID 34215)
-- Name: pos_order_items pos_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- TOC entry 6097 (class 2606 OID 34210)
-- Name: pos_order_items pos_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.pos_orders(id) ON DELETE CASCADE;


--
-- TOC entry 6094 (class 2606 OID 34197)
-- Name: pos_orders pos_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 6095 (class 2606 OID 34192)
-- Name: pos_orders pos_orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6158 (class 2606 OID 35306)
-- Name: processing_records processing_records_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.processing_records
    ADD CONSTRAINT processing_records_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE SET NULL;


--
-- TOC entry 6159 (class 2606 OID 35311)
-- Name: processing_records processing_records_herd_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.processing_records
    ADD CONSTRAINT processing_records_herd_id_fkey FOREIGN KEY (herd_id) REFERENCES public.herds_flocks(id) ON DELETE SET NULL;


--
-- TOC entry 6160 (class 2606 OID 35301)
-- Name: processing_records processing_records_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.processing_records
    ADD CONSTRAINT processing_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6161 (class 2606 OID 35354)
-- Name: rainfall_records rainfall_records_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.rainfall_records
    ADD CONSTRAINT rainfall_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6072 (class 2606 OID 33436)
-- Name: report_configurations report_configurations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.report_configurations
    ADD CONSTRAINT report_configurations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6102 (class 2606 OID 34299)
-- Name: restaurant_order_items restaurant_order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_order_items
    ADD CONSTRAINT restaurant_order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id);


--
-- TOC entry 6103 (class 2606 OID 34294)
-- Name: restaurant_order_items restaurant_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_order_items
    ADD CONSTRAINT restaurant_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.restaurant_orders(id) ON DELETE CASCADE;


--
-- TOC entry 6104 (class 2606 OID 34313)
-- Name: restaurant_order_items restaurant_order_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_order_items
    ADD CONSTRAINT restaurant_order_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6098 (class 2606 OID 34277)
-- Name: restaurant_orders restaurant_orders_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.accounts(id);


--
-- TOC entry 6099 (class 2606 OID 34272)
-- Name: restaurant_orders restaurant_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id);


--
-- TOC entry 6100 (class 2606 OID 34267)
-- Name: restaurant_orders restaurant_orders_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(id);


--
-- TOC entry 6101 (class 2606 OID 34262)
-- Name: restaurant_orders restaurant_orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6156 (class 2606 OID 35173)
-- Name: sale_fee_types sale_fee_types_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_fee_types
    ADD CONSTRAINT sale_fee_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6154 (class 2606 OID 35151)
-- Name: sale_ticket_fees sale_ticket_fees_sale_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_fees
    ADD CONSTRAINT sale_ticket_fees_sale_ticket_id_fkey FOREIGN KEY (sale_ticket_id) REFERENCES public.sale_tickets(id) ON DELETE CASCADE;


--
-- TOC entry 6155 (class 2606 OID 35146)
-- Name: sale_ticket_fees sale_ticket_fees_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_fees
    ADD CONSTRAINT sale_ticket_fees_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6151 (class 2606 OID 35128)
-- Name: sale_ticket_items sale_ticket_items_animal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_items
    ADD CONSTRAINT sale_ticket_items_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES public.animals(id) ON DELETE SET NULL;


--
-- TOC entry 6152 (class 2606 OID 35123)
-- Name: sale_ticket_items sale_ticket_items_sale_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_items
    ADD CONSTRAINT sale_ticket_items_sale_ticket_id_fkey FOREIGN KEY (sale_ticket_id) REFERENCES public.sale_tickets(id) ON DELETE CASCADE;


--
-- TOC entry 6153 (class 2606 OID 35118)
-- Name: sale_ticket_items sale_ticket_items_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_ticket_items
    ADD CONSTRAINT sale_ticket_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6150 (class 2606 OID 35098)
-- Name: sale_tickets sale_tickets_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.sale_tickets
    ADD CONSTRAINT sale_tickets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6107 (class 2606 OID 34436)
-- Name: social_connections social_connections_platform_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_connections
    ADD CONSTRAINT social_connections_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES public.social_platforms(id) ON DELETE CASCADE;


--
-- TOC entry 6110 (class 2606 OID 34488)
-- Name: social_post_platforms social_post_platforms_connection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_post_platforms
    ADD CONSTRAINT social_post_platforms_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.social_connections(id) ON DELETE CASCADE;


--
-- TOC entry 6111 (class 2606 OID 34483)
-- Name: social_post_platforms social_post_platforms_social_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_post_platforms
    ADD CONSTRAINT social_post_platforms_social_post_id_fkey FOREIGN KEY (social_post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE;


--
-- TOC entry 6108 (class 2606 OID 34455)
-- Name: social_posts social_posts_blog_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_blog_post_id_fkey FOREIGN KEY (blog_post_id) REFERENCES public.blog_posts(id) ON DELETE SET NULL;


--
-- TOC entry 6109 (class 2606 OID 34460)
-- Name: social_posts social_posts_parent_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_parent_post_id_fkey FOREIGN KEY (parent_post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE;


--
-- TOC entry 6031 (class 2606 OID 33632)
-- Name: tags tags_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6113 (class 2606 OID 34559)
-- Name: tenant_site_settings tenant_site_settings_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.tenant_site_settings
    ADD CONSTRAINT tenant_site_settings_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.site_themes(id);


--
-- TOC entry 6112 (class 2606 OID 34536)
-- Name: theme_sections theme_sections_theme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.theme_sections
    ADD CONSTRAINT theme_sections_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.site_themes(id) ON DELETE CASCADE;


--
-- TOC entry 6057 (class 2606 OID 33173)
-- Name: trailer_order_items trailer_order_items_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.trailer_order_items
    ADD CONSTRAINT trailer_order_items_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_items(id) ON DELETE SET NULL;


--
-- TOC entry 6058 (class 2606 OID 33168)
-- Name: trailer_order_items trailer_order_items_trailer_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.trailer_order_items
    ADD CONSTRAINT trailer_order_items_trailer_order_id_fkey FOREIGN KEY (trailer_order_id) REFERENCES public.trailer_orders(id) ON DELETE CASCADE;


--
-- TOC entry 6039 (class 2606 OID 33542)
-- Name: transactions transactions_accepted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES public.accounts(id);


--
-- TOC entry 6040 (class 2606 OID 33536)
-- Name: transactions transactions_accepted_gl_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_accepted_gl_account_id_fkey FOREIGN KEY (accepted_gl_account_id) REFERENCES public.accounts_chart(id);


--
-- TOC entry 6041 (class 2606 OID 33016)
-- Name: transactions transactions_bank_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6042 (class 2606 OID 33524)
-- Name: transactions transactions_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- TOC entry 6043 (class 2606 OID 33021)
-- Name: transactions transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- TOC entry 6044 (class 2606 OID 35406)
-- Name: transactions transactions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 6045 (class 2606 OID 35390)
-- Name: transactions transactions_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- TOC entry 6162 (class 2606 OID 35382)
-- Name: vendors vendors_default_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_default_class_id_fkey FOREIGN KEY (default_class_id) REFERENCES public.classes(id);


--
-- TOC entry 6163 (class 2606 OID 35377)
-- Name: vendors vendors_default_expense_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: robin
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_default_expense_account_id_fkey FOREIGN KEY (default_expense_account_id) REFERENCES public.accounts_chart(id);


--
-- TOC entry 6366 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO robin;


-- Completed on 2026-01-18 10:00:42

--
-- PostgreSQL database dump complete
--

