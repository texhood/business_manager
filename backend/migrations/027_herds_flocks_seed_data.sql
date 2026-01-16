-- ============================================================================
-- HERDS, FLOCKS & PASTURES - SEED DATA
-- Import historical animal and sales data
-- Run AFTER 026_herds_flocks_pastures.sql
-- ============================================================================

-- ============================================================================
-- INSERT OWNERS (extracted from legacy data)
-- ============================================================================

INSERT INTO animal_owners (name) VALUES
    ('Hood Farms'),
    ('Bruce Miles'),
    ('John Miles'),
    ('Greyson Moriarty'),
    ('Keagan Hood'),
    ('Zelenovic'),
    ('Kirkpatrick Cattle Company')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- INSERT ADDITIONAL BREEDS (extracted from legacy data)
-- ============================================================================

INSERT INTO breeds (name, species) VALUES
    ('Hereford-Angus-Charolais', 'Cattle')
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- INSERT PASTURES
-- ============================================================================

INSERT INTO pastures (name, size_acres) VALUES
    ('Paddock 1', 2.50)
ON CONFLICT (tenant_id, name) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTION: Get or create breed ID
-- ============================================================================

CREATE OR REPLACE FUNCTION get_breed_id(breed_name VARCHAR) RETURNS INTEGER AS $$
DECLARE
    result_id INTEGER;
BEGIN
    SELECT id INTO result_id FROM breeds WHERE name = breed_name AND tenant_id = '00000000-0000-0000-0000-000000000001' LIMIT 1;
    IF result_id IS NULL AND breed_name IS NOT NULL THEN
        INSERT INTO breeds (name, species) VALUES (breed_name, 'Cattle') RETURNING id INTO result_id;
    END IF;
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INSERT ANIMALS
-- Note: This inserts animals without dam/sire references first,
-- then we can update the references in a second pass if needed
-- ============================================================================

-- Insert animals (ear_tag is not unique in legacy data, so we don't enforce uniqueness)
INSERT INTO animals (ear_tag, name, animal_type_id, category_id, breed_id, color_markings, owner_id, birth_date, death_date, purchase_date, purchase_price, status)
SELECT 
    ear_tag,
    animal_name,
    (SELECT id FROM animal_types WHERE name = animal_type LIMIT 1),
    (SELECT id FROM animal_categories WHERE name = category LIMIT 1),
    get_breed_id(breed),
    color_markings,
    (SELECT id FROM animal_owners WHERE name = TRIM(ownership) LIMIT 1),
    birth_date,
    death_date,
    purchase_date,
    purchase_price,
    status::animal_status
FROM (VALUES
    ('1Blue', 'Spot', 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2019-04-15'::DATE, NULL::DATE, '2019-11-16'::DATE, 700.00, 'Sold'),
    ('1Orange', 'Left', 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2019-04-15', NULL, '2019-11-23', 700.00, 'Sold'),
    ('1Yellow', NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2019-04-15', NULL, '2019-11-23', 700.00, 'Sold'),
    ('3', 'Tweedle Dee', 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2019-04-15', NULL, '2019-11-23', 700.00, 'Sold'),
    ('3-24', NULL, 'Calf', 'For sale', 'Angus', 'Black', 'Hood Farms', '2024-07-08', NULL, NULL, NULL, 'Active'),
    ('4', NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2019-04-15', NULL, '2019-11-23', 700.00, 'Sold'),
    ('20-192', NULL, 'Calf', 'For sale', 'Angus x Hereford', 'Black', 'Hood Farms', '2020-02-14', '2021-02-18', NULL, NULL, 'Dead'),
    ('20-233', 'Vaquero', 'Calf', 'Harvested', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2020-03-11', '2021-09-09', NULL, NULL, 'Dead'),
    ('20-279', NULL, 'Calf', 'For sale', 'Mashona', 'Black', 'Hood Farms', '2020-09-10', NULL, NULL, NULL, 'Sold'),
    ('20-29W', NULL, 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Hood Farms', '2020-09-03', '2020-09-03', NULL, NULL, 'Dead'),
    ('20-39', 'Easter', 'Cow', 'Breeders', 'Angus-Mashona', 'Brown', 'Bruce Miles', '2020-04-12', NULL, NULL, NULL, 'Active'),
    ('20-49', 'Snuggy', 'Calf', 'Dead', 'Angus-Mashona', 'Black', 'Greyson Moriarty', '2020-09-08', '2021-11-16', NULL, NULL, 'Dead'),
    ('20-53', NULL, 'Calf', 'Harvested', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms', '2020-08-12', '2022-07-20', NULL, NULL, 'Dead'),
    ('20-54', NULL, 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Keagan Hood', '2020-08-13', NULL, NULL, NULL, 'Sold'),
    ('20-61', 'Rambo', 'Calf', 'Harvested', 'Angus-Mashona', 'Black', 'Hood Farms', '2020-03-08', '2021-09-09', NULL, NULL, 'Dead'),
    ('20-68', 'Summer', 'Calf', 'Harvested', 'Angus-Mashona', 'Black', 'Hood Farms', '2020-07-12', '2022-07-20', NULL, NULL, 'Dead'),
    ('20-70', 'Mocha', 'Calf', 'Breeders', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms', '2020-06-30', NULL, NULL, NULL, 'Sold'),
    ('21-190', NULL, 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms', '2021-01-05', NULL, NULL, NULL, 'Active'),
    ('21-1B', 'Red Bull', 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Red', 'Hood Farms', '2021-06-23', NULL, NULL, NULL, 'Dead'),
    ('21-233', '38', 'Cow', 'Breeders', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms', '2021-06-22', NULL, NULL, NULL, 'Active'),
    ('21-279', NULL, 'Cow', 'Breeders', 'Mashona', 'Brown', 'Hood Farms', '2021-05-21', NULL, NULL, NULL, 'Active'),
    ('21-285', NULL, 'Cow', 'Breeders', 'Mashona', 'Brown-black', 'Hood Farms', '2021-03-03', NULL, NULL, NULL, 'Active'),
    ('21-292', NULL, 'Calf', 'For sale', 'Mashona', 'Black', 'Hood Farms', '2021-05-22', NULL, NULL, NULL, 'Active'),
    ('21-3', NULL, 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Black bald face', 'Hood Farms', '2021-06-03', NULL, NULL, NULL, 'Active'),
    ('21-54', 'BB', 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Hood Farms', '2021-06-16', NULL, NULL, NULL, 'Active'),
    ('21-68', NULL, 'Cow', 'Breeders', 'Angus-Mashona', 'Black', 'Hood Farms', '2021-07-01', NULL, NULL, NULL, 'Sold'),
    ('22-01', NULL, 'Calf', 'Breeders', 'Angus x Hereford x Mashona', 'Black bald face', 'Hood Farms', '2022-05-05', NULL, NULL, NULL, 'Sold'),
    ('22-02', NULL, 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Black bald face', 'Hood Farms', '2022-05-13', NULL, NULL, NULL, 'Active'),
    ('22-03', NULL, 'Calf', 'For sale', 'Angus x Hereford x Mashona', 'Red bald face', 'Hood Farms', '2022-06-06', NULL, NULL, NULL, 'Active'),
    ('22-04', NULL, 'Calf', 'Breeders', 'Angus x Hereford x Mashona', 'Black', 'Hood Farms', '2022-08-26', NULL, NULL, NULL, 'Sold'),
    ('22-68', NULL, 'Calf', 'For sale', 'Angus', 'Black bald face', 'Hood Farms', '2022-09-20', NULL, NULL, NULL, 'Sold'),
    ('23-276', 'Little Red', 'Cow', 'Breeders', 'Mashona', 'Red', 'Hood Farms', '2023-03-01', NULL, NULL, NULL, 'Active'),
    ('24-01', NULL, 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Hood Farms', '2024-06-26', NULL, NULL, NULL, 'Active'),
    ('24-276', NULL, 'Calf', 'For sale', 'Angus-Mashona', 'Black', 'Hood Farms', '2024-07-16', NULL, NULL, NULL, 'Active'),
    ('29W', 'Stephanie', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2017-12-04', NULL, '2018-06-02', 1200.00, 'Sold'),
    ('39Blu', 'Old Girl', 'Cow', 'purchased', 'Angus', 'White splash on udder', 'Bruce Miles', '2012-04-06', NULL, '2014-04-04', 1850.00, 'Sold'),
    ('39Yel', 'Little Bull', 'Bull', 'Breeders', 'Angus x Charolais', 'Dusky white', 'Hood Farms', '2017-11-04', NULL, NULL, NULL, 'Sold'),
    ('40Ora', 'Miss Aggie', 'Cow', 'purchased', 'Brangus', 'Black brindle', 'Hood Farms', '2012-04-06', NULL, '2014-04-06', 1850.00, 'Sold'),
    ('40Yel', 'Bianca', 'Calf', 'Breeders', 'Angus x Charolais', 'Dusky white', 'Hood Farms', '2016-11-18', NULL, NULL, NULL, 'Sold'),
    ('41Blu', 'Stupid', 'Cow', 'Breeders', 'Brangus', 'Black', 'Hood Farms', '2012-04-06', NULL, '2014-04-06', 1850.00, 'Sold'),
    ('42Blu', 'Miss Piggy', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2012-04-05', NULL, '2014-04-06', 1850.00, 'Sold'),
    ('42Yel', 'Piglet', 'Calf', 'Breeders', 'Angus x Charolais', 'Dusky white', 'Hood Farms', '2016-11-27', NULL, NULL, NULL, 'Sold'),
    ('43Whi', 'Kirkpatrick 43', 'Bull', 'Rented', 'Charolais', 'White', 'Hood Farms', NULL, NULL, '2017-11-24', NULL, 'Reference'),
    ('44Grn', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2013-04-23', NULL, '2015-04-23', 2300.00, 'Sold'),
    ('45Ora', NULL, 'Cow', 'Breeders', 'Brangus', 'Black', 'John Miles', '2013-04-23', NULL, '2015-04-23', 2300.00, 'Sold'),
    ('46Grn', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Bruce Miles', '2010-04-23', NULL, '2015-04-23', 2300.00, 'Sold'),
    ('47Blu', NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms', '2011-08-24', NULL, '2016-08-24', 1350.00, 'Sold'),
    ('47Yel', '47-1', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2017-02-21', NULL, NULL, NULL, 'Sold'),
    ('48Blu', NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms', '2011-08-24', NULL, '2016-08-24', 1350.00, 'Sold'),
    ('49Blu', 'La Barge', 'Cow', 'purchased', 'Angus', 'Black', 'Greyson Moriarty', '2011-08-24', NULL, '2016-08-24', 1350.00, 'Sold'),
    ('50Blu', 'Big Mama', 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms', '2011-08-24', NULL, '2016-08-24', 1350.00, 'Sold'),
    ('50Yel', '50-1', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2017-02-25', '2019-02-09', NULL, NULL, 'Dead'),
    ('51Blu', '51Blu', 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms', '2015-10-29', NULL, '2017-10-28', 1650.00, 'Sold'),
    ('52Blu', NULL, 'Cow', 'purchased', 'Angus', 'Black brindle', 'Hood Farms', '2015-10-29', NULL, '2017-10-28', 1650.00, 'Sold'),
    ('53-19', 'Emma', 'Cow', 'Breeders', 'Angus x Hereford x Mashona', 'Black', 'Keagan Hood', '2019-05-24', NULL, NULL, NULL, 'Active'),
    ('53Blu', 'Skull Face', 'Cow', 'purchased', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2015-10-29', NULL, '2017-10-28', 1650.00, 'Sold'),
    ('54Blu', NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Keagan Hood', '2013-10-29', NULL, '2017-10-28', 1650.00, 'Sold'),
    ('55Blu', NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms', '2012-10-29', NULL, '2017-10-28', 1650.00, 'Sold'),
    ('56Blu', NULL, 'Cow', 'purchased', 'Angus', 'Black', 'Hood Farms', '2012-10-29', NULL, '2017-10-28', 1650.00, 'Sold'),
    ('57Blu', '57Blu', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2016-03-10', NULL, '2018-03-10', 1600.00, 'Sold'),
    ('58Blu', '58Blu', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2016-03-10', NULL, '2018-03-10', 1600.00, 'Sold'),
    ('59Blu', '59Blu', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2016-03-10', NULL, '2018-03-10', 1600.00, 'Sold'),
    ('60Blu', '60Blu', 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2016-03-10', NULL, '2018-03-10', 1600.00, 'Sold'),
    ('61Blu', 'Gabby', 'Cow', 'Breeders', 'Brangus', 'Black', 'Hood Farms', '2018-02-23', NULL, '2018-03-10', NULL, 'Sold'),
    ('62Blue', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', NULL, NULL, '2018-10-05', 1475.00, 'Sold'),
    ('63Blue', NULL, 'Cow', 'Breeders', 'Hereford', 'Red bald face', 'Hood Farms', NULL, NULL, '2018-10-05', 1475.00, 'Sold'),
    ('64Blue', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', NULL, NULL, '2018-10-05', 1475.00, 'Sold'),
    ('65Blue', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', NULL, NULL, '2018-10-05', 1475.00, 'Sold'),
    ('66Blue', NULL, 'Cow', 'Breeders', 'Brangus', 'Black', 'Hood Farms', '2014-10-26', NULL, '2018-10-26', 1290.00, 'Sold'),
    ('67Blue', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2014-10-26', NULL, '2018-10-26', 1290.00, 'Sold'),
    ('68Blue', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2016-10-26', NULL, '2018-10-26', 1290.00, 'Sold'),
    ('69Blue', NULL, 'Cow', 'Breeders', 'Angus', 'Black', 'Hood Farms', '2013-10-26', NULL, '2018-10-26', 1290.00, 'Sold'),
    ('70Blue', 'Speck', 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2014-10-26', NULL, '2018-10-26', 1290.00, 'Sold'),
    ('71Blue', NULL, 'Cow', 'Breeders', 'Hereford', 'Red bald face', 'Zelenovic', '2013-10-26', NULL, '2018-10-26', 1290.00, 'Sold'),
    ('190', 'Blaze', 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2014-11-19', NULL, '2019-11-16', 1150.00, 'Sold'),
    ('190-19', 'Socks', 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2019-11-19', NULL, NULL, NULL, 'Active'),
    ('192', NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2014-11-19', NULL, '2019-11-16', 1150.00, 'Sold'),
    ('233', NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2014-11-19', NULL, '2019-11-19', 1150.00, 'Sold'),
    ('276', 'Red', 'Cow', 'Breeders', 'Mashona', 'Red', 'Hood Farms', NULL, NULL, '2019-12-14', 1000.00, 'Active'),
    ('279', '305', 'Cow', 'Breeders', 'Mashona', 'Black', 'Hood Farms', NULL, NULL, '2019-12-14', 1000.00, 'Sold'),
    ('285', '286', 'Cow', 'Breeders', 'Mashona', 'Black', 'Hood Farms', NULL, NULL, '2019-12-14', 1000.00, 'Sold'),
    ('291', '345', 'Cow', 'Breeders', 'Mashona', 'Black', 'Hood Farms', NULL, NULL, '2019-12-14', 1000.00, 'Sold'),
    ('292', '292', 'Cow', 'Breeders', 'Mashona', 'Black', 'Hood Farms', NULL, NULL, '2019-12-14', 1000.00, 'Sold'),
    ('416 Kirkpatrick Charolais bull', '416 Curly', 'Bull', 'Rented', 'Charolais', 'White', 'Kirkpatrick Cattle Company', NULL, NULL, NULL, NULL, 'Reference'),
    ('510 Mashona', '510 Mashona', 'Bull', 'Breeders', 'Mashona', 'Black', 'Hood Farms', '2016-08-11', NULL, '2018-08-11', 1800.00, 'Sold'),
    ('Unknown', 'Unknown', 'Bull', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Reference'),
    ('Whisenhunt Angus Bull 23', 'Whisenhunt Angus Bull 23', 'Bull', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Reference'),
    ('27', NULL, 'Cow', 'Breeders', 'Angus x Hereford', 'Black bald face', 'Hood Farms', '2025-02-01', NULL, NULL, NULL, 'Active')
) AS v(ear_tag, animal_name, animal_type, category, breed, color_markings, ownership, birth_date, death_date, purchase_date, purchase_price, status);

-- ============================================================================
-- INSERT SALES RECORDS
-- ============================================================================

INSERT INTO animal_sales (animal_id, sale_date, sale_price, sold_to, tenant_id)
SELECT 
    a.id,
    s.sale_date,
    s.sale_price,
    s.sold_to,
    '00000000-0000-0000-0000-000000000001'
FROM (VALUES
    ('1Orange', '2024-12-14'::DATE, 1500.00, 'Tri-County Livestock Market, Inc.'),
    ('21-68', '2024-12-14', 1327.20, 'Tri-County Livestock Market, Inc.'),
    ('285', '2024-12-14', 1175.00, 'Tri-County Livestock Market, Inc.'),
    ('291', '2024-12-14', 1625.00, 'Tri-County Livestock Market, Inc.'),
    ('1Blue', '2022-12-03', 650.00, 'Tri-County Livestock Market, Inc.'),
    ('1Yellow', '2022-12-03', 800.00, 'Tri-County Livestock Market, Inc.'),
    ('3', '2022-12-03', 264.00, 'Tri-County Livestock Market, Inc.'),
    ('4', '2022-12-03', NULL, 'Tri-County Livestock Market, Inc.'),
    ('20-279', '2022-12-03', 792.00, 'Tri-County Livestock Market, Inc.'),
    ('20-54', '2022-12-03', 789.60, 'Tri-County Livestock Market, Inc.'),
    ('20-70', '2022-12-03', 375.00, 'Tri-County Livestock Market, Inc.'),
    ('22-01', '2022-12-03', 0.00, 'Tri-County Livestock Market, Inc.'),
    ('279', '2022-12-03', 275.00, 'Tri-County Livestock Market, Inc.'),
    ('292', '2022-12-03', 275.00, 'Tri-County Livestock Market, Inc.'),
    ('510 Mashona', '2022-12-03', 920.15, 'Tri-County Livestock Market, Inc.'),
    ('22-68', '2022-10-15', 190.00, 'Tri-County Livestock Market, Inc.'),
    ('53Blu', '2022-10-15', 514.50, 'Tri-County Livestock Market, Inc.'),
    ('54Blu', '2022-10-15', 332.50, 'Tri-County Livestock Market, Inc.'),
    ('68Blue', '2022-10-15', 687.30, 'Tri-County Livestock Market, Inc.'),
    ('70Blue', '2022-10-15', 755.55, 'Tri-County Livestock Market, Inc.'),
    ('190', '2022-10-15', 543.40, 'Tri-County Livestock Market, Inc.'),
    ('192', '2022-10-15', 649.60, 'Tri-County Livestock Market, Inc.'),
    ('233', '2022-10-15', 632.70, 'Tri-County Livestock Market, Inc.'),
    ('29W', '2020-10-24', 435.00, 'Tri-County Livestock Market, Inc.'),
    ('39Blu', '2020-10-24', 189.90, 'Tri-County Livestock Market, Inc.'),
    ('49Blu', '2020-10-24', 750.60, 'Tri-County Livestock Market, Inc.'),
    ('61Blu', '2020-10-24', 410.00, 'Tri-County Livestock Market, Inc.'),
    ('39Yel', '2019-08-31', 750.00, 'Tri-County Livestock Market, Inc.'),
    ('47Blu', '2019-08-31', 548.10, 'Tri-County Livestock Market, Inc.'),
    ('47Yel', '2019-08-31', 875.00, 'Tri-County Livestock Market, Inc.'),
    ('48Blu', '2019-08-31', 700.00, 'Tri-County Livestock Market, Inc.'),
    ('50Blu', '2019-08-31', 725.00, 'Tri-County Livestock Market, Inc.'),
    ('57Blu', '2019-08-31', 720.00, 'Tri-County Livestock Market, Inc.'),
    ('62Blue', '2019-08-31', 1075.00, 'Tri-County Livestock Market, Inc.'),
    ('63Blue', '2019-08-31', 800.00, 'Tri-County Livestock Market, Inc.'),
    ('64Blue', '2019-08-31', 1100.00, 'Tri-County Livestock Market, Inc.'),
    ('65Blue', '2019-08-31', 382.50, 'Tri-County Livestock Market, Inc.'),
    ('66Blue', '2019-08-31', 925.00, 'Tri-County Livestock Market, Inc.'),
    ('67Blue', '2019-08-31', 750.00, 'Tri-County Livestock Market, Inc.'),
    ('69Blue', '2019-08-31', 900.00, 'Tri-County Livestock Market, Inc.'),
    ('71Blue', '2019-08-31', 725.00, 'Tri-County Livestock Market, Inc.'),
    ('51Blu', '2018-07-23', 600.00, 'Hunt Livestock Exchange'),
    ('52Blu', '2018-07-23', 500.00, 'Hunt Livestock Exchange'),
    ('55Blu', '2018-07-23', 520.00, 'Hunt Livestock Exchange'),
    ('56Blu', '2018-07-23', 410.88, 'Hunt Livestock Exchange'),
    ('58Blu', '2018-07-23', 520.00, 'Hunt Livestock Exchange'),
    ('59Blu', '2018-07-23', 520.00, 'Hunt Livestock Exchange'),
    ('60Blu', '2018-07-23', 760.00, 'Hunt Livestock Exchange'),
    ('40Ora', '2017-08-14', 990.00, 'Hunt Livestock Exchange'),
    ('42Blu', '2017-08-14', 1000.00, 'Hunt Livestock Exchange'),
    ('44Grn', '2017-08-14', 922.25, 'Hunt Livestock Exchange'),
    ('45Ora', '2017-08-14', 1021.20, 'Hunt Livestock Exchange'),
    ('46Grn', '2017-08-14', 890.00, 'Hunt Livestock Exchange'),
    ('41Blu', '2015-10-03', 975.00, 'Tri-County Livestock Market, Inc.')
) AS s(ear_tag, sale_date, sale_price, sold_to)
JOIN animals a ON a.ear_tag = s.ear_tag AND a.tenant_id = '00000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (
    SELECT 1 FROM animal_sales existing 
    WHERE existing.animal_id = a.id 
    AND existing.sale_date = s.sale_date
);

-- ============================================================================
-- CLEANUP
-- ============================================================================

DROP FUNCTION IF EXISTS get_breed_id(VARCHAR);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

COMMENT ON TABLE animals IS 'Livestock inventory with historical data imported from legacy system';
