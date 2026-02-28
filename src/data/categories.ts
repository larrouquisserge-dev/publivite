// ============================================================
// CATÉGORIES ET CHAMPS LEBONCOIN - Données extraites de reposter.io
// 78 catégories avec tous les champs spécifiques et règles conditionnelles
// ============================================================

export type FieldType = 'text' | 'number' | 'select' | 'multi-select' | 'date' | 'toggle' | 'textarea';

export interface FieldOption {
  value: string;
  label: string;
}

export interface ConditionalField {
  /** Le champ parent qui déclenche l'affichage */
  parentField: string;
  /** La valeur du parent qui déclenche l'affichage */
  parentValue: string | string[];
  /** Les champs à afficher */
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: FieldOption[];
  /** Nom de l'attribut dans l'API reposter/leboncoin */
  apiName?: string;
  /** Champs conditionnels qui apparaissent selon la valeur de ce champ */
  conditionalFields?: ConditionalField[];
  /** Dépend d'un autre champ (pour les options dynamiques) */
  dependsOn?: string;
  /** Notes pour l'utilisateur */
  notes?: string;
}

export interface SubCategory {
  value: string;
  label: string;
  fields: FormField[];
}

export interface Category {
  value: string;
  label: string;
  icon: string;
  group: 'vehicules' | 'immobilier' | 'multimedia' | 'maison' | 'mode' | 'loisirs' | 'materiel_pro' | 'services' | 'divers';
  /** Champs spécifiques à la catégorie */
  fields: FormField[];
  /** Sous-catégories (ex: type de bien pour immobilier) */
  subCategories?: SubCategory[];
  /** Supporte la livraison */
  hasShipping?: boolean;
  /** Champs communs (Particulier/Pro) */
  hasProMode?: boolean;
}

// ============================================================
// OPTIONS COMMUNES RÉUTILISABLES
// ============================================================

const ITEM_STATES: FieldOption[] = [
  { value: 'etatneuf', label: 'État neuf' },
  { value: 'tresbonetat', label: 'Très bon état' },
  { value: 'bonetat', label: 'Bon état' },
  { value: 'etatsatisfaisant', label: 'État satisfaisant - fonctionnel' },
  { value: 'pourpieces', label: 'Pour pièces' },
];

const COLORS: FieldOption[] = [
  { value: 'argent', label: 'Argent / Silver' }, { value: 'blanc', label: 'Blanc' },
  { value: 'bleu', label: 'Bleu' }, { value: 'gris', label: 'Gris' },
  { value: 'jaune', label: 'Jaune' }, { value: 'marron', label: 'Marron' },
  { value: 'noir', label: 'Noir' }, { value: 'or', label: 'Or' },
  { value: 'or_rose', label: 'Or rose' }, { value: 'orange', label: 'Orange' },
  { value: 'rose', label: 'Rose' }, { value: 'rouge', label: 'Rouge' },
  { value: 'vert', label: 'Vert' }, { value: 'violet', label: 'Violet' },
  { value: 'autre', label: 'Autre' }, { value: 'multicolore', label: 'Multicolore' },
];

const VEHICLE_COLORS: FieldOption[] = [
  { value: 'argent', label: 'Argent' }, { value: 'beige', label: 'Beige' },
  { value: 'blanc', label: 'Blanc' }, { value: 'bleu', label: 'Bleu' },
  { value: 'bordeaux', label: 'Bordeaux' }, { value: 'gris', label: 'Gris' },
  { value: 'ivoire', label: 'Ivoire' }, { value: 'jaune', label: 'Jaune' },
  { value: 'marron', label: 'Marron' }, { value: 'noir', label: 'Noir' },
  { value: 'golden', label: 'Doré' }, { value: 'orange', label: 'Orange' },
  { value: 'rose', label: 'Rose' }, { value: 'rouge', label: 'Rouge' },
  { value: 'vert', label: 'Vert' }, { value: 'violet', label: 'Violet' },
  { value: 'autre', label: 'Autre' },
];

const ENERGY_CLASSES: FieldOption[] = [
  { value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' },
  { value: 'd', label: 'D' }, { value: 'e', label: 'E' }, { value: 'f', label: 'F' },
  { value: 'g', label: 'G' }, { value: 'n', label: 'Non soumis au DPE' },
];

const GES_OPTIONS: FieldOption[] = [...ENERGY_CLASSES];

const PROPERTY_STATES: FieldOption[] = [
  { value: '1', label: 'Très bon état' },
  { value: '2', label: 'Bon état' },
  { value: '3', label: 'Rénové' },
  { value: '4', label: 'À rafraichir' },
  { value: '5', label: 'Travaux à prévoir' },
];

const EXPOSITIONS: FieldOption[] = [
  { value: 'north', label: 'Nord' }, { value: 'south', label: 'Sud' },
  { value: 'east', label: 'Est' }, { value: 'west', label: 'Ouest' },
  { value: 'north_east', label: 'Nord-Est' }, { value: 'north_west', label: 'Nord-Ouest' },
  { value: 'south_east', label: 'Sud-Est' }, { value: 'south_west', label: 'Sud-Ouest' },
];

const PARKING_OPTIONS: FieldOption[] = [
  { value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' },
  { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' },
  { value: '999999', label: '6 et plus' },
];

const BEDROOMS_OPTIONS: FieldOption[] = [
  { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
  { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' },
  { value: '7', label: '7' }, { value: '999999', label: '8 et plus' },
];

const HEATING_TYPE: FieldOption[] = [
  { value: 'electric', label: 'Electrique' }, { value: 'fuel', label: 'Fioul' },
  { value: 'gas', label: 'Gaz' }, { value: 'solar', label: 'Solaire' },
  { value: 'other', label: 'Autre' },
];

const YES_NO: FieldOption[] = [
  { value: 'true', label: 'Oui' }, { value: 'false', label: 'Non' },
];

const CRIT_AIR: FieldOption[] = [
  { value: '0', label: "Crit'Air 0" }, { value: '1', label: "Crit'Air 1" },
  { value: '2', label: "Crit'Air 2" }, { value: '3', label: "Crit'Air 3" },
  { value: '4', label: "Crit'Air 4" }, { value: '5', label: "Crit'Air 5" },
  { value: '6', label: 'Non classé' },
];

const EMISSION_CLASS: FieldOption[] = [
  { value: 'euro1', label: 'Euro 1' }, { value: 'euro2', label: 'Euro 2' },
  { value: 'euro3', label: 'Euro 3' }, { value: 'euro4', label: 'Euro 4' },
  { value: 'euro5', label: 'Euro 5' }, { value: 'euro6', label: 'Euro 6' },
];

const CAR_FUELS: FieldOption[] = [
  { value: '1', label: 'Essence' }, { value: '2', label: 'Diesel' },
  { value: '3', label: 'GPL' }, { value: '4', label: 'Électrique' },
  { value: '5', label: 'Autre' }, { value: '6', label: 'Hybride' },
  { value: '7', label: 'Gaz Naturel (GNV)' }, { value: '8', label: 'Hybride Rechargeable' },
  { value: '9', label: 'Hydrogène' },
];

const GEARBOX: FieldOption[] = [
  { value: '1', label: 'Manuelle' }, { value: '2', label: 'Automatique' },
];

const CAR_BRANDS: FieldOption[] = [
  { value: 'AUDI', label: 'Audi' }, { value: 'BMW', label: 'BMW' },
  { value: 'CITROEN', label: 'Citroën' }, { value: 'FIAT', label: 'Fiat' },
  { value: 'FORD', label: 'Ford' }, { value: 'MERCEDES-BENZ', label: 'Mercedes-Benz' },
  { value: 'OPEL', label: 'Opel' }, { value: 'PEUGEOT', label: 'Peugeot' },
  { value: 'RENAULT', label: 'Renault' }, { value: 'VOLKSWAGEN', label: 'Volkswagen' },
  { value: 'ABARTH', label: 'Abarth' }, { value: 'ALFA ROMEO', label: 'Alfa Romeo' },
  { value: 'ALPINE', label: 'Alpine' }, { value: 'ASTON MARTIN', label: 'Aston Martin' },
  { value: 'BENTLEY', label: 'Bentley' }, { value: 'BUGATTI', label: 'Bugatti' },
  { value: 'CADILLAC', label: 'Cadillac' }, { value: 'CHEVROLET', label: 'Chevrolet' },
  { value: 'CHRYSLER', label: 'Chrysler' }, { value: 'CUPRA', label: 'Cupra' },
  { value: 'DACIA', label: 'Dacia' }, { value: 'DS', label: 'DS' },
  { value: 'FERRARI', label: 'Ferrari' }, { value: 'HONDA', label: 'Honda' },
  { value: 'HYUNDAI', label: 'Hyundai' }, { value: 'INFINITI', label: 'Infiniti' },
  { value: 'JAGUAR', label: 'Jaguar' }, { value: 'JEEP', label: 'Jeep' },
  { value: 'KIA', label: 'Kia' }, { value: 'LAMBORGHINI', label: 'Lamborghini' },
  { value: 'LAND-ROVER', label: 'Land Rover' }, { value: 'LEXUS', label: 'Lexus' },
  { value: 'LOTUS', label: 'Lotus' }, { value: 'MASERATI', label: 'Maserati' },
  { value: 'MAZDA', label: 'Mazda' }, { value: 'MCLAREN', label: 'McLaren' },
  { value: 'MINI', label: 'Mini' }, { value: 'MITSUBISHI', label: 'Mitsubishi' },
  { value: 'NISSAN', label: 'Nissan' }, { value: 'PORSCHE', label: 'Porsche' },
  { value: 'ROLLS-ROYCE', label: 'Rolls-Royce' }, { value: 'SEAT', label: 'Seat' },
  { value: 'SKODA', label: 'Skoda' }, { value: 'SMART', label: 'Smart' },
  { value: 'SUBARU', label: 'Subaru' }, { value: 'SUZUKI', label: 'Suzuki' },
  { value: 'TESLA', label: 'Tesla' }, { value: 'TOYOTA', label: 'Toyota' },
  { value: 'VOLVO', label: 'Volvo' }, { value: 'AUTRE', label: 'Autre' },
];

const MOTO_BRANDS: FieldOption[] = [
  { value: 'BMW', label: 'BMW' }, { value: 'HONDA', label: 'Honda' },
  { value: 'KAWASAKI', label: 'Kawasaki' }, { value: 'SUZUKI', label: 'Suzuki' },
  { value: 'YAMAHA', label: 'Yamaha' }, { value: 'APRILIA', label: 'Aprilia' },
  { value: 'BENELLI', label: 'Benelli' }, { value: 'DUCATI', label: 'Ducati' },
  { value: 'HARLEY-DAVIDSON', label: 'Harley-Davidson' }, { value: 'HUSQVARNA', label: 'Husqvarna' },
  { value: 'INDIAN', label: 'Indian' }, { value: 'KTM', label: 'KTM' },
  { value: 'KYMCO', label: 'Kymco' }, { value: 'MV-AGUSTA', label: 'MV Agusta' },
  { value: 'PEUGEOT', label: 'Peugeot' }, { value: 'PIAGGIO', label: 'Piaggio' },
  { value: 'ROYAL ENFIELD', label: 'Royal Enfield' }, { value: 'SYM', label: 'SYM' },
  { value: 'TRIUMPH', label: 'Triumph' }, { value: 'VESPA', label: 'Vespa' },
  { value: 'AUTRE', label: 'Autre' },
];

const YEAR_OPTIONS: FieldOption[] = Array.from({ length: 67 }, (_, i) => {
  const year = 2026 - i;
  return { value: String(year), label: year === 1960 ? '1960 ou avant' : String(year) };
});

const CAR_DOORS: FieldOption[] = [
  { value: '2', label: '2' }, { value: '3', label: '3' },
  { value: '4', label: '4' }, { value: '5', label: '5' },
  { value: '999999', label: '6 ou plus' },
];

const CAR_SEATS: FieldOption[] = [
  { value: '1', label: '1' }, { value: '2', label: '2' },
  { value: '3', label: '3' }, { value: '4', label: '4' },
  { value: '5', label: '5' }, { value: '6', label: '6' },
  { value: '999999', label: '7 ou plus' },
];

const CAR_VEHICLE_TYPE: FieldOption[] = [
  { value: '4x4', label: '4x4, SUV & Crossover' }, { value: 'citadine', label: 'Citadine' },
  { value: 'berline', label: 'Berline' }, { value: 'break', label: 'Break' },
  { value: 'cabriolet', label: 'Cabriolet' }, { value: 'coupe', label: 'Coupé' },
  { value: 'monospace', label: 'Monospace & minibus' },
  { value: 'voituresociete', label: 'Voiture société, commerciale' },
  { value: 'autre', label: 'Autre' },
];

const CAR_UPHOLSTERY: FieldOption[] = [
  { value: 'tout_cuir', label: 'Tout cuir' }, { value: 'cuir_partiel', label: 'Cuir partiel' },
  { value: 'tissu', label: 'Tissu' }, { value: 'velours', label: 'Velours' },
  { value: 'alcantara', label: 'Alcantara' }, { value: 'autre', label: 'Autre' },
];

const CAR_EQUIPMENTS: FieldOption[] = [
  { value: '4x4', label: '4 roues motrices' },
  { value: 'hud', label: 'Affichage tête haute (HUD)' },
  { value: 'parking_assist', label: 'Aide au stationnement' },
  { value: 'camera_360', label: 'Aide au stationnement avec Caméra 360' },
  { value: 'alarm', label: 'Alarme antivol' },
  { value: 'afil', label: 'Alerte de franchissement involontaire de ligne (AFIL)' },
  { value: 'auto_headlights', label: 'Allumage automatique des phares' },
  { value: 'carplay_android', label: 'Apple CarPlay / Android Auto' },
  { value: 'towing', label: 'Attelage de remorque' },
  { value: 'roof_bars', label: 'Barres de toit intégrées' },
  { value: 'bluetooth', label: 'Bluetooth' },
  { value: 'rear_camera', label: 'Caméra de recul' },
  { value: 'wireless_charger', label: 'Chargeur sans fil pour smartphone' },
  { value: 'usb', label: 'Chargeurs USB' },
  { value: 'ac', label: 'Climatisation' },
  { value: 'electric_trunk', label: 'Coffre à ouverture électrique' },
  { value: 'semi_autonomous', label: 'Conduite semi-autonome' },
  { value: 'blind_spot', label: "Détecteur d'angle mort" },
  { value: 'dashcam', label: 'Enregistreur de conduite (Dashcam)' },
  { value: 'auto_wipers', label: 'Essuie-glaces automatiques' },
  { value: 'alloy_wheels', label: 'Jantes en alliage' },
  { value: 'computer', label: 'Ordinateur de bord' },
  { value: 'heated_windshield', label: 'Pare-brise chauffant' },
  { value: 'adaptive_headlights', label: 'Phares adaptatifs' },
  { value: 'fog_lights', label: 'Phares anti-brouillard' },
  { value: 'directional_lights', label: 'Phares directionnels' },
  { value: 'led_xenon', label: 'Phares LED / Xenon' },
  { value: 'trip_planner', label: 'Planificateur intelligent de trajet' },
  { value: 'heat_pump', label: 'Pompe à chaleur (pour véhicules électriques)' },
  { value: 'dab_radio', label: 'Radio numérique DAB' },
  { value: 'sign_recognition', label: 'Reconnaissance des panneaux de signalisation' },
  { value: 'cruise_control', label: 'Régulateur de vitesse' },
  { value: 'adaptive_cruise', label: 'Régulateur de vitesse adaptatif' },
  { value: 'heated_mirrors', label: 'Rétroviseurs dégivrants' },
  { value: 'folding_mirrors', label: 'Rétroviseurs rabattables électriquement' },
  { value: 'spare_wheel', label: 'Roue de secours' },
  { value: 'folding_rear_seat', label: 'Siège arrière rabattable' },
  { value: 'height_seat', label: 'Siège réglable en hauteur' },
  { value: 'sliding_rear', label: 'Sièges arrières coulissants' },
  { value: 'heated_seats', label: 'Sièges chauffants' },
  { value: 'electric_seats', label: 'Sièges électriques' },
  { value: 'leather_seats', label: 'Sièges en cuir' },
  { value: 'massage_seats', label: 'Sièges massants' },
  { value: 'sport_seats', label: 'Sièges sport' },
  { value: 'ventilated_seats', label: 'Sièges ventilés' },
  { value: 'sport_suspension', label: 'Suspension sport / adaptative' },
  { value: 'premium_audio', label: 'Système audio haut de gamme' },
  { value: 'keyless', label: "Système d'accès sans clé" },
  { value: 'navigation', label: 'Système de navigation' },
  { value: 'sentry_mode', label: 'Système de surveillance (Mode Sentinelle)' },
  { value: 'tpms', label: 'Système de surveillance pression pneus (TPMS)' },
  { value: 'sunroof', label: 'Toit ouvrant / Toit panoramique' },
  { value: 'rear_windows', label: 'Vitres électriques arrières' },
  { value: 'tinted_windows', label: 'Vitres surteintées à l\'arrière' },
  { value: 'heated_steering', label: 'Volant chauffant' },
  { value: 'adjustable_steering_height', label: 'Volant réglable en hauteur' },
  { value: 'adjustable_steering_depth', label: 'Volant réglable en profondeur' },
];

const VEHICLE_HISTORY: FieldOption[] = [
  { value: 'carnet_entretien', label: "Carnet d'entretien disponible" },
  { value: 'non_fumeur', label: 'Véhicule non fumeur' },
  { value: 'factures', label: 'Factures disponibles' },
  { value: 'reparations', label: 'Réparations utiles déjà faites' },
  { value: 'ct_valide', label: 'État du contrôle technique valide' },
  { value: 'importe', label: 'Véhicule importé' },
  { value: 'location', label: 'Véhicule de location' },
  { value: 'auto_ecole', label: "Véhicule d'auto-école" },
  { value: 'premiere_main', label: 'Première main' },
  { value: 'garantie_constructeur', label: 'Sous garantie constructeur' },
  { value: 'garantie_garage', label: 'Sous garantie garage' },
];

const VEHICLE_CONDITION: FieldOption[] = [
  { value: 'excellent_condition', label: 'Excellent état (proche du neuf)' },
  { value: 'undamaged', label: 'Non endommagé' },
  { value: 'good_overall_condition', label: 'Bon état général' },
  { value: 'normal_wear_and_tear', label: "Traces d'usure normales" },
  { value: 'minor_repairs_needed', label: 'Réparations mineures à prévoir' },
  { value: 'major_repairs_needed', label: 'Réparations majeures à prévoir' },
  { value: 'damaged', label: 'Endommagé' },
  { value: 'not_drivable', label: 'Non roulant' },
];

const PROPERTY_CHARACTERISTICS: FieldOption[] = [
  { value: 'acces_pmr', label: 'Accès PMR' },
  { value: 'chauffage_sol', label: 'Chauffage au sol' },
  { value: 'construction_ancienne', label: 'Construction ancienne' },
  { value: 'construction_recente', label: 'Construction récente' },
  { value: 'sous_sol', label: 'Sous-sol' },
  { value: 'cave', label: 'Cave' },
  { value: 'grenier', label: 'Grenier' },
  { value: 'plusieurs_toilettes', label: 'Plusieurs toilettes' },
  { value: 'vendu_loue', label: 'Vendu loué' },
  { value: 'batiment_classe', label: 'Bâtiment classé' },
  { value: 'avec_dependance', label: 'Avec dépendance' },
  { value: 'cuisine_equipee', label: 'Cuisine équipée' },
  { value: 'cuisine_ouverte', label: 'Cuisine ouverte' },
  { value: 'baignoire', label: 'Baignoire' },
];

const PROPERTY_EXTERIOR: FieldOption[] = [
  { value: 'balcon', label: 'Balcon' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'jardin', label: 'Jardin' },
  { value: 'piscine', label: 'Piscine' },
];

const HOUSE_NATURE: FieldOption[] = [
  { value: 'individuelle', label: 'Maison individuelle' },
  { value: 'ville', label: 'Maison de ville' },
  { value: 'collective', label: 'Résidence collective' },
  { value: 'plain_pied', label: 'Maison de plain-pied' },
  { value: 'ferme', label: 'Ferme' },
  { value: 'mitoyenne', label: 'Maison mitoyenne' },
  { value: 'villa', label: 'Villa' },
  { value: 'autre', label: 'Autre' },
];

const COMPUTER_TYPE: FieldOption[] = [
  { value: 'desktop', label: 'Fixe' },
  { value: 'laptop', label: 'Portable' },
  { value: 'centralunit', label: 'Unité centrale (seule)' },
];

const COMPUTER_USAGE: FieldOption[] = [
  { value: 'gaming', label: 'Gaming' },
  { value: 'versatile', label: 'Polyvalent' },
  { value: 'office', label: 'Bureautique' },
];

const TECH_BRANDS: FieldOption[] = [
  { value: 'apple', label: 'Apple' }, { value: 'samsung', label: 'Samsung' },
  { value: 'hp', label: 'HP' }, { value: 'dell', label: 'Dell' },
  { value: 'lenovo', label: 'Lenovo' }, { value: 'microsoft', label: 'Microsoft' },
  { value: 'asus', label: 'Asus' }, { value: 'acer', label: 'Acer' },
  { value: 'msi', label: 'MSI' }, { value: 'other', label: 'Autre' },
];

const PHONE_BRANDS: FieldOption[] = [
  { value: 'apple', label: 'Apple' }, { value: 'samsung', label: 'Samsung' },
  { value: 'huawei', label: 'Huawei' }, { value: 'xiaomi', label: 'Xiaomi' },
  { value: 'google', label: 'Google' }, { value: 'honor', label: 'Honor' },
  { value: 'oneplus', label: 'OnePlus' }, { value: 'oppo', label: 'Oppo' },
  { value: 'motorola', label: 'Motorola' }, { value: 'nokia', label: 'Nokia' },
  { value: 'sony', label: 'Sony' }, { value: 'lg', label: 'LG' },
  { value: 'autre', label: 'Autre' },
];

const PHONE_PRODUCTS: FieldOption[] = [
  { value: 'smartphone', label: 'Smartphone' },
  { value: 'landline_phone', label: 'Téléphone fixe' },
  { value: 'smartwatch', label: 'Montre connectée' },
  { value: 'gps_tracker', label: 'GPS et balise (AirTag, SmarTag)' },
  { value: 'fitness_tracker', label: 'Bracelet connecté' },
  { value: 'voice_assistant', label: 'Assistant vocal' },
  { value: 'home_automation', label: 'Domotique' },
];

const STORAGE_OPTIONS: FieldOption[] = [
  { value: '8go', label: '8 Go' }, { value: '16go', label: '16 Go' },
  { value: '32go', label: '32 Go' }, { value: '64go', label: '64 Go' },
  { value: '128go', label: '128 Go' }, { value: '256go', label: '256 Go' },
  { value: '512go', label: '512 Go' }, { value: '999999', label: '+ de 512 Go' },
];

const FURNITURE_TYPE: FieldOption[] = [
  { value: 'sofa_and_armchair', label: 'Canapé et fauteuil' },
  { value: 'storage_furniture', label: 'Meuble de rangement' },
  { value: 'bed_and_mattress', label: 'Lit et matelas' },
  { value: 'table_and_desk', label: 'Table et bureau' },
  { value: 'chair_and_stool', label: 'Chaise et tabouret' },
  { value: 'accessory', label: 'Accessoire' },
];

const FURNITURE_ROOM: FieldOption[] = [
  { value: 'kitchenanddinningroom', label: 'Cuisine et salle à manger' },
  { value: 'kitchen', label: 'Cuisine' }, { value: 'dinningroom', label: 'Salle à manger' },
  { value: 'livingroom', label: 'Salon' }, { value: 'office', label: 'Bureau' },
  { value: 'bedroom', label: 'Chambre' }, { value: 'bathroom', label: 'Salle de bains' },
  { value: 'entrance', label: 'Entrée' }, { value: 'other', label: 'Autre' },
];

const FURNITURE_BRANDS: FieldOption[] = [
  { value: 'ikea', label: 'Ikea' }, { value: 'conforama', label: 'Conforama' },
  { value: 'but', label: 'But' }, { value: 'roche_bobois', label: 'Roche Bobois' },
  { value: 'ligne_roset', label: 'Ligne Roset' }, { value: 'boconcept', label: 'BoConcept' },
  { value: 'maisons_du_monde', label: 'Maisons du Monde' }, { value: 'habitat', label: 'Habitat' },
  { value: 'miliboo', label: 'Miliboo' }, { value: 'gautier', label: 'Gautier' },
  { value: 'cinna', label: 'Cinna' }, { value: 'la_redoute', label: 'La Redoute' },
  { value: 'alinea', label: 'Alinéa' }, { value: 'autre', label: 'Autre' },
];

const FURNITURE_MATERIALS: FieldOption[] = [
  { value: 'acier', label: 'Acier' }, { value: 'bois', label: 'Bois' },
  { value: 'boismassif', label: 'Bois massif' }, { value: 'bronze', label: 'Bronze' },
  { value: 'ceramique', label: 'Céramique' }, { value: 'chene', label: 'Chêne' },
  { value: 'cuir', label: 'Cuir' }, { value: 'fer', label: 'Fer' },
  { value: 'formica', label: 'Formica' }, { value: 'laque', label: 'Laqué' },
  { value: 'marbre', label: 'Marbre' }, { value: 'metal', label: 'Métal' },
  { value: 'pierre', label: 'Pierre' }, { value: 'pin', label: 'Pin' },
  { value: 'plastique', label: 'Plastique' }, { value: 'rotinetosier', label: 'Rotin et osier' },
  { value: 'tissu', label: 'Tissu' }, { value: 'velour', label: 'Velours' },
  { value: 'verre', label: 'Verre' }, { value: 'autre', label: 'Autre' },
];

const FURNITURE_COLORS: FieldOption[] = [
  { value: 'argente', label: 'Argenté' }, { value: 'beige', label: 'Beige' },
  { value: 'blanc', label: 'Blanc' }, { value: 'bleu', label: 'Bleu' },
  { value: 'bois', label: 'Bois' }, { value: 'bordeaux', label: 'Bordeaux' },
  { value: 'dore', label: 'Doré' }, { value: 'gris', label: 'Gris' },
  { value: 'jaune', label: 'Jaune' }, { value: 'kaki', label: 'Kaki' },
  { value: 'marron', label: 'Marron' }, { value: 'multicolor', label: 'Multicolore' },
  { value: 'noir', label: 'Noir' }, { value: 'orange', label: 'Orange' },
  { value: 'rose', label: 'Rose' }, { value: 'rouge', label: 'Rouge' },
  { value: 'transparent', label: 'Transparent' }, { value: 'vert', label: 'Vert' },
  { value: 'violet', label: 'Violet' }, { value: 'autre', label: 'Autre' },
];

const APPLIANCE_TYPE: FieldOption[] = [
  { value: 'groselectromenager', label: 'Gros électroménager' },
  { value: 'cuisine', label: 'Cuisine et cuisson' },
  { value: 'maisonetentretien', label: 'Entretien de la maison' },
  { value: 'beautesoindelapersonne', label: 'Beauté et Soin de la personne' },
];

const APPLIANCE_BRANDS: FieldOption[] = [
  { value: 'bosch', label: 'Bosch' }, { value: 'siemens', label: 'Siemens' },
  { value: 'samsung', label: 'Samsung' }, { value: 'lg', label: 'LG' },
  { value: 'whirlpool', label: 'Whirlpool' }, { value: 'electrolux', label: 'Electrolux' },
  { value: 'miele', label: 'Miele' }, { value: 'philips', label: 'Philips' },
  { value: 'moulinex', label: 'Moulinex' }, { value: 'seb', label: 'Seb' },
  { value: 'tefal', label: 'Tefal' }, { value: 'dyson', label: 'Dyson' },
  { value: 'delonghi', label: 'DeLonghi' }, { value: 'smeg', label: 'Smeg' },
  { value: 'kitchenaid', label: 'KitchenAid' }, { value: 'autre', label: 'Autre' },
];

const CLOTHING_UNIVERSE: FieldOption[] = [
  { value: '1', label: 'Femme' }, { value: '2', label: 'Maternité' },
  { value: '3', label: 'Homme' }, { value: '4', label: 'Enfant' },
];

const CLOTHING_TYPE: FieldOption[] = [
  { value: 'robe', label: 'Robes / jupes' },
  { value: 'manteau', label: 'Manteaux & Vestes' },
  { value: 'haut', label: 'Hauts / T-Shirts / Polos' },
  { value: 'pantalon', label: 'Pantalons' },
  { value: 'pull', label: 'Pulls / Gilets / Mailles' },
  { value: 'jean', label: 'Jeans' },
  { value: 'chemise', label: 'Chemises / Chemisiers' },
  { value: 'costume', label: 'Costumes / Tailleurs' },
  { value: 'short', label: 'Shorts / Pantacourts / Bermudas' },
  { value: 'sport', label: 'Sports / Danse' },
  { value: 'maillot', label: 'Maillots de bain & vêtements de plage' },
  { value: 'lingerie', label: 'Lingerie' },
  { value: 'sousvetement', label: 'Sous-vêtements & vêtements de nuit' },
  { value: 'deguisement', label: 'Déguisement' },
  { value: 'mariage', label: 'Mariage' },
  { value: 'autre', label: 'Autre' },
];

const CLOTHING_CONDITION: FieldOption[] = [
  { value: '1', label: 'État satisfaisant' },
  { value: '2', label: 'Bon état' },
  { value: '3', label: 'Très bon état' },
  { value: '4', label: 'Neuf sans étiquette' },
  { value: '5', label: 'Neuf avec étiquette' },
];

const REAL_ESTATE_TYPE: FieldOption[] = [
  { value: '1', label: 'Maison' },
  { value: '2', label: 'Appartement' },
  { value: '3', label: 'Terrain' },
  { value: '4', label: 'Parking' },
  { value: '5', label: 'Autre' },
];

const SALE_TYPE: FieldOption[] = [
  { value: 'ancien', label: 'Ancien' },
  { value: 'viager', label: 'Viager' },
];

const MOTORCYCLE_TYPE: FieldOption[] = [
  { value: 'moto', label: 'Moto' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'quad', label: 'Quad' },
  { value: 'moped&motorbike', label: 'Cyclomoteur & vélomoteur' },
  { value: 'autre', label: 'Autre' },
];

const LICENCE_TYPE: FieldOption[] = [
  { value: 'permisa', label: 'Permis A' },
  { value: 'permisal', label: 'Permis AL' },
  { value: 'sanspermis', label: 'Sans permis' },
];

const BIKE_TYPE: FieldOption[] = [
  { value: 'vtt', label: 'VTT' },
  { value: 'route', label: 'Vélo de route' },
  { value: 'ville', label: 'Vélo de ville' },
  { value: 'electrique', label: 'Vélo électrique' },
  { value: 'pliant', label: 'Vélo pliant' },
  { value: 'cargo', label: 'Vélo cargo' },
  { value: 'bmx', label: 'BMX' },
  { value: 'enfant', label: 'Vélo enfant' },
  { value: 'autre', label: 'Autre' },
];

const UNIVERSE_OPTIONS: FieldOption[] = [
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
  { value: 'enfant', label: 'Enfant' },
  { value: 'mixte', label: 'Mixte' },
];

// ============================================================
// GROUPES DE CATÉGORIES
// ============================================================

export const CATEGORY_GROUPS = {
  vehicules: { label: 'Véhicules', icon: 'Car' },
  immobilier: { label: 'Immobilier', icon: 'Home' },
  multimedia: { label: 'Multimédia', icon: 'Smartphone' },
  maison: { label: 'Maison', icon: 'Sofa' },
  mode: { label: 'Mode', icon: 'Shirt' },
  loisirs: { label: 'Loisirs', icon: 'Gamepad2' },
  materiel_pro: { label: 'Matériel professionnel', icon: 'Briefcase' },
  services: { label: 'Services', icon: 'Wrench' },
  divers: { label: 'Divers', icon: 'Package' },
};

// ============================================================
// DÉFINITION DES 78 CATÉGORIES
// ============================================================

export const CATEGORIES: Category[] = [
  // ==================== VÉHICULES ====================
  {
    value: 'voitures',
    label: 'Voitures',
    icon: 'Car',
    group: 'vehicules',
    hasProMode: true,
    fields: [
      { 
        name: 'licence_plate_number', 
        label: "Plaque d'immatriculation", 
        type: 'text', 
        required: false, 
        apiName: 'attributes.licence_plate_number',
        placeholder: 'AA-123-BB',
        notes: 'Permet le pré-remplissage automatique des champs'
      },
      { 
        name: 'brand', 
        label: 'Marque', 
        type: 'select', 
        required: true, 
        apiName: 'attributes.brand', 
        options: CAR_BRANDS,
        notes: 'Le modèle dépend de la marque sélectionnée'
      },
      { name: 'model', label: 'Modèle', type: 'text', required: true, apiName: 'attributes.model', dependsOn: 'brand' },
      { name: 'regdate', label: 'Année modèle', type: 'select', required: true, apiName: 'attributes.regdate', options: YEAR_OPTIONS },
      { name: 'issuance_date', label: 'Date de première mise en circulation', type: 'text', required: false, apiName: 'attributes.issuance_date', placeholder: 'MM / AAAA' },
      { name: 'vehicle_technical_inspection', label: 'Date de fin de validité du contrôle technique', type: 'text', required: false, apiName: 'attributes.vehicle_technical_inspection', placeholder: 'MM / AAAA' },
      { 
        name: 'fuel', 
        label: 'Énergie', 
        type: 'select', 
        required: true, 
        apiName: 'attributes.fuel', 
        options: CAR_FUELS,
        conditionalFields: [
          {
            parentField: 'fuel',
            parentValue: '4', // Électrique
            fields: [
              { name: 'battery_soh', label: 'État de santé de la batterie (SoH!)', type: 'text', required: false, apiName: 'attributes.battery_soh' },
              { name: 'battery_soh_date', label: 'Date du dernier certificat SoH', type: 'text', required: false, apiName: 'attributes.battery_soh_date', placeholder: 'MM / AAAA' },
            ]
          }
        ]
      },
      { name: 'gearbox', label: 'Boîte de vitesse', type: 'select', required: true, apiName: 'attributes.gearbox', options: GEARBOX },
      { name: 'vehicle_type', label: 'Type de véhicule', type: 'select', required: false, apiName: 'attributes.vehicle_type', options: CAR_VEHICLE_TYPE },
      { name: 'doors', label: 'Nombre de portes', type: 'select', required: false, apiName: 'attributes.doors', options: CAR_DOORS },
      { name: 'seats', label: 'Nombre de place(s)', type: 'select', required: false, apiName: 'attributes.seats', options: CAR_SEATS },
      { name: 'horse_power', label: 'Puissance fiscale', type: 'text', required: false, apiName: 'attributes.horse_power' },
      { name: 'horse_power_din', label: 'Puissance DIN', type: 'text', required: false, apiName: 'attributes.horse_power_din' },
      { name: 'licence', label: 'Permis', type: 'select', required: false, apiName: 'attributes.licence', options: [
        { value: 'avecpermis', label: 'Avec permis' }, { value: 'sanspermis', label: 'Sans permis' }
      ]},
      { name: 'mileage', label: 'Kilométrage', type: 'number', required: true, apiName: 'attributes.mileage' },
      { name: 'color', label: 'Couleur', type: 'select', required: false, apiName: 'attributes.color', options: VEHICLE_COLORS },
      { name: 'upholstery', label: 'Sellerie', type: 'multi-select', required: false, apiName: 'attributes.upholstery', options: CAR_UPHOLSTERY },
      { name: 'equipments', label: 'Équipements', type: 'multi-select', required: false, apiName: 'attributes.equipments', options: CAR_EQUIPMENTS },
      { name: 'vehicle_history', label: 'Historique et entretien', type: 'multi-select', required: false, apiName: 'attributes.vehicle_history', options: VEHICLE_HISTORY },
      { name: 'vehicle_condition', label: 'État du véhicule', type: 'select', required: false, apiName: 'attributes.vehicle_condition', options: VEHICLE_CONDITION },
      { name: 'critair', label: "Crit'Air", type: 'select', required: false, apiName: 'attributes.critair', options: CRIT_AIR },
      { name: 'emission_class', label: "Classe d'émission", type: 'select', required: false, apiName: 'attributes.emission_class', options: EMISSION_CLASS },
    ],
  },
  {
    value: 'motos',
    label: 'Motos',
    icon: 'Bike',
    group: 'vehicules',
    fields: [
      { name: 'brand', label: 'Marque', type: 'select', required: true, apiName: 'attributes.brand', options: MOTO_BRANDS },
      { name: 'regdate', label: 'Année modèle', type: 'select', required: true, apiName: 'attributes.regdate', options: YEAR_OPTIONS },
      { name: 'issuance_date', label: 'Date de première mise en circulation', type: 'text', required: false, apiName: 'attributes.issuance_date', placeholder: 'MM / AAAA' },
      { name: 'gearbox', label: 'Boîte de vitesse', type: 'select', required: false, apiName: 'attributes.gearbox', options: GEARBOX },
      { name: 'mileage', label: 'Kilométrage', type: 'number', required: true, apiName: 'attributes.mileage' },
      { name: 'cubic_capacity', label: 'Cylindrée', type: 'text', required: false, apiName: 'attributes.cubic_capacity' },
      { name: 'horse_power_din', label: 'Puissance', type: 'text', required: false, apiName: 'attributes.horse_power_din' },
      { name: 'vehicle_history', label: 'Historique et entretien', type: 'multi-select', required: false, apiName: 'attributes.vehicle_history', options: VEHICLE_HISTORY },
      { name: 'color', label: 'Couleur', type: 'select', required: false, apiName: 'attributes.color', options: VEHICLE_COLORS },
      { name: 'motorcycle_type', label: 'Type', type: 'select', required: false, apiName: 'attributes.motorcycle_type', options: MOTORCYCLE_TYPE },
      { name: 'licence_type', label: 'Type de permis', type: 'select', required: false, apiName: 'attributes.licence_type', options: LICENCE_TYPE },
      { name: 'critair', label: "Crit'Air", type: 'select', required: false, apiName: 'attributes.critair', options: CRIT_AIR },
      { name: 'emission_class', label: "Classe d'émission", type: 'select', required: false, apiName: 'attributes.emission_class', options: EMISSION_CLASS },
    ],
  },
  {
    value: 'caravaning',
    label: 'Caravaning',
    icon: 'Caravan',
    group: 'vehicules',
    fields: [
      { name: 'caravan_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'camping_car', label: 'Camping-car' }, { value: 'caravane', label: 'Caravane' },
        { value: 'van', label: 'Van aménagé' }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'regdate', label: 'Année modèle', type: 'select', required: false, options: YEAR_OPTIONS },
      { name: 'mileage', label: 'Kilométrage', type: 'number', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'utilitaires',
    label: 'Utilitaires',
    icon: 'Truck',
    group: 'vehicules',
    hasProMode: true,
    fields: [
      { name: 'brand', label: 'Marque', type: 'select', required: true, options: CAR_BRANDS },
      { name: 'model', label: 'Modèle', type: 'text', required: true, dependsOn: 'brand' },
      { name: 'regdate', label: 'Année modèle', type: 'select', required: true, options: YEAR_OPTIONS },
      { name: 'fuel', label: 'Énergie', type: 'select', required: true, options: CAR_FUELS },
      { name: 'gearbox', label: 'Boîte de vitesse', type: 'select', required: false, options: GEARBOX },
      { name: 'mileage', label: 'Kilométrage', type: 'number', required: true },
      { name: 'color', label: 'Couleur', type: 'select', required: false, options: VEHICLE_COLORS },
      { name: 'vehicle_condition', label: 'État du véhicule', type: 'select', required: false, options: VEHICLE_CONDITION },
    ],
  },
  {
    value: 'equipement_auto',
    label: 'Équipement auto',
    icon: 'Wrench',
    group: 'vehicules',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'equipement_moto',
    label: 'Équipement moto',
    icon: 'HardHat',
    group: 'vehicules',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'nautisme',
    label: 'Nautisme',
    icon: 'Ship',
    group: 'vehicules',
    fields: [
      { name: 'boat_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'voilier', label: 'Voilier' }, { value: 'moteur', label: 'Bateau à moteur' },
        { value: 'pneumatique', label: 'Pneumatique' }, { value: 'jet_ski', label: 'Jet-ski' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'equipement_nautisme',
    label: 'Équipement nautisme',
    icon: 'Anchor',
    group: 'vehicules',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'velos',
    label: 'Vélos',
    icon: 'Bike',
    group: 'vehicules',
    hasShipping: true,
    fields: [
      { name: 'universe', label: 'Univers', type: 'select', required: false, options: UNIVERSE_OPTIONS },
      { name: 'bike_type', label: 'Type', type: 'select', required: false, options: BIKE_TYPE },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
      { name: 'bike_id', label: "Numéro d'identification du vélo", type: 'text', required: false },
    ],
  },
  {
    value: 'equipements_velos',
    label: 'Équipements vélos',
    icon: 'Cog',
    group: 'vehicules',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'equipement_caravaning',
    label: 'Équipement caravaning',
    icon: 'Tent',
    group: 'vehicules',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'tracteurs',
    label: 'Tracteurs',
    icon: 'Tractor',
    group: 'vehicules',
    fields: [
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'regdate', label: 'Année modèle', type: 'select', required: false, options: YEAR_OPTIONS },
      { name: 'mileage', label: 'Heures de fonctionnement', type: 'number', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'poids_lourds',
    label: 'Poids lourds',
    icon: 'Truck',
    group: 'vehicules',
    fields: [
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'regdate', label: 'Année modèle', type: 'select', required: false, options: YEAR_OPTIONS },
      { name: 'mileage', label: 'Kilométrage', type: 'number', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },

  // ==================== IMMOBILIER ====================
  {
    value: 'ventes_immobilieres',
    label: 'Ventes immobilières',
    icon: 'Home',
    group: 'immobilier',
    hasProMode: true,
    fields: [
      { 
        name: 'real_estate_type', 
        label: 'Type de bien', 
        type: 'select', 
        required: true, 
        apiName: 'attributes.real_estate_type', 
        options: REAL_ESTATE_TYPE,
        conditionalFields: [
          {
            parentField: 'real_estate_type',
            parentValue: ['1', '2'], // Maison ou Appartement
            fields: [
              { name: 'surface', label: 'Surface habitable (m²)', type: 'number', required: false, apiName: 'attributes.surface' },
              { name: 'rooms', label: 'Nombre de pièces', type: 'number', required: false, apiName: 'attributes.rooms' },
              { name: 'bedrooms', label: 'Nombre de chambres', type: 'select', required: false, apiName: 'attributes.bedrooms', options: BEDROOMS_OPTIONS },
              { name: 'bathrooms', label: 'Nombre de salles de bain', type: 'number', required: false, apiName: 'attributes.bathrooms' },
              { name: 'floors', label: 'Nombre de niveaux', type: 'number', required: false, apiName: 'attributes.floors' },
              { name: 'property_condition', label: 'État du bien', type: 'select', required: false, apiName: 'attributes.property_condition', options: PROPERTY_STATES },
              { name: 'construction_year', label: 'Année de construction', type: 'text', required: false, apiName: 'attributes.construction_year' },
              { name: 'property_nature', label: 'Nature du bien', type: 'multi-select', required: false, apiName: 'attributes.property_nature', options: HOUSE_NATURE },
              { name: 'characteristics', label: 'Caractéristiques', type: 'multi-select', required: false, apiName: 'attributes.characteristics', options: PROPERTY_CHARACTERISTICS },
              { name: 'outdoor', label: 'Extérieur', type: 'multi-select', required: false, apiName: 'attributes.outdoor', options: PROPERTY_EXTERIOR },
              { name: 'land_surface', label: 'Surface totale du terrain (m²)', type: 'number', required: false, apiName: 'attributes.land_surface' },
              { name: 'parking', label: 'Places de parking', type: 'select', required: false, apiName: 'attributes.parking', options: PARKING_OPTIONS },
              { name: 'exposition', label: 'Exposition', type: 'select', required: false, apiName: 'attributes.exposition', options: EXPOSITIONS },
              { name: 'heating_mode', label: 'Mode de chauffage', type: 'select', required: false, apiName: 'attributes.heating_mode', options: HEATING_TYPE },
              { name: 'energy_class', label: 'Classe énergie', type: 'select', required: false, apiName: 'attributes.energy_class', options: ENERGY_CLASSES },
              { name: 'ges', label: 'GES', type: 'select', required: false, apiName: 'attributes.ges', options: GES_OPTIONS },
              { name: 'energy_cost', label: "Estimation du coût annuel d'énergie (€)", type: 'number', required: false, apiName: 'attributes.energy_cost' },
              { name: 'condo_charges', label: 'Charges annuelles de copropriété (€)', type: 'number', required: false, apiName: 'attributes.condo_charges' },
            ]
          },
          {
            parentField: 'real_estate_type',
            parentValue: '3', // Terrain
            fields: [
              { name: 'land_surface', label: 'Surface totale du terrain (m²)', type: 'number', required: false, apiName: 'attributes.land_surface' },
            ]
          },
          {
            parentField: 'real_estate_type',
            parentValue: '4', // Parking
            fields: [
              { name: 'parking', label: 'Places de parking', type: 'select', required: false, apiName: 'attributes.parking', options: PARKING_OPTIONS },
            ]
          }
        ]
      },
      { name: 'available_from', label: 'Disponible à partir de', type: 'text', required: false, apiName: 'attributes.available_from', placeholder: 'MM / AAAA' },
      { name: 'property_tax', label: 'Taxe foncière (€)', type: 'number', required: false, apiName: 'attributes.property_tax' },
      { name: 'sale_type', label: 'Type de vente', type: 'select', required: false, apiName: 'attributes.sale_type', options: SALE_TYPE },
    ],
  },
  {
    value: 'locations',
    label: 'Locations',
    icon: 'Key',
    group: 'immobilier',
    hasProMode: true,
    fields: [
      { 
        name: 'real_estate_type', 
        label: 'Type de bien', 
        type: 'select', 
        required: true, 
        apiName: 'attributes.real_estate_type', 
        options: REAL_ESTATE_TYPE,
        conditionalFields: [
          {
            parentField: 'real_estate_type',
            parentValue: ['1', '2'], // Maison ou Appartement
            fields: [
              { name: 'surface', label: 'Surface habitable (m²)', type: 'number', required: false, apiName: 'attributes.surface' },
              { name: 'rooms', label: 'Nombre de pièces', type: 'number', required: false, apiName: 'attributes.rooms' },
              { name: 'bedrooms', label: 'Nombre de chambres', type: 'select', required: false, apiName: 'attributes.bedrooms', options: BEDROOMS_OPTIONS },
              { name: 'furnished', label: 'Ce bien est :', type: 'select', required: false, apiName: 'attributes.furnished', options: [
                { value: '1', label: 'Meublé' }, { value: '2', label: 'Non meublé' }
              ]},
              { name: 'property_condition', label: 'État du bien', type: 'select', required: false, apiName: 'attributes.property_condition', options: PROPERTY_STATES },
              { name: 'property_nature', label: 'Nature du bien', type: 'multi-select', required: false, apiName: 'attributes.property_nature', options: HOUSE_NATURE },
              { name: 'characteristics', label: 'Caractéristiques', type: 'multi-select', required: false, apiName: 'attributes.characteristics', options: PROPERTY_CHARACTERISTICS },
              { name: 'outdoor', label: 'Extérieur', type: 'multi-select', required: false, apiName: 'attributes.outdoor', options: PROPERTY_EXTERIOR },
              { name: 'land_surface', label: 'Surface totale du terrain (m²)', type: 'number', required: false, apiName: 'attributes.land_surface' },
              { name: 'parking', label: 'Places de parking', type: 'select', required: false, apiName: 'attributes.parking', options: PARKING_OPTIONS },
              { name: 'exposition', label: 'Exposition', type: 'select', required: false, apiName: 'attributes.exposition', options: EXPOSITIONS },
              { name: 'heating_mode', label: 'Mode de chauffage', type: 'select', required: false, apiName: 'attributes.heating_mode', options: HEATING_TYPE },
              { name: 'energy_class', label: 'Classe énergie', type: 'select', required: false, apiName: 'attributes.energy_class', options: ENERGY_CLASSES },
              { name: 'ges', label: 'GES', type: 'select', required: false, apiName: 'attributes.ges', options: GES_OPTIONS },
            ]
          }
        ]
      },
      { name: 'rental_charges', label: 'Charges locatives (€)', type: 'number', required: true, apiName: 'attributes.rental_charges' },
      { name: 'rent_control', label: "Zone soumise à l'encadrement des loyers ?", type: 'select', required: true, apiName: 'attributes.rent_control', options: YES_NO },
      { name: 'deposit', label: 'Dépôt de garantie (€)', type: 'number', required: false, apiName: 'attributes.deposit' },
      { name: 'available_from', label: 'Disponible à partir de', type: 'text', required: false, apiName: 'attributes.available_from', placeholder: 'MM / AAAA' },
    ],
  },
  {
    value: 'colocations',
    label: 'Colocations',
    icon: 'Users',
    group: 'immobilier',
    fields: [
      { name: 'property_type', label: 'Type de bien', type: 'select', required: false, options: [
        { value: 'appartement', label: 'Appartement' }, { value: 'maison', label: 'Maison' },
      ]},
      { name: 'coloc_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'chambre', label: 'Chambre' }, { value: 'logement_entier', label: 'Logement entier' },
      ]},
      { name: 'furnished', label: 'Ce bien est :', type: 'select', required: false, options: [
        { value: '1', label: 'Meublé' }, { value: '2', label: 'Non meublé' }
      ]},
      { name: 'nb_roommates', label: 'Nombre de colocataires', type: 'number', required: false },
      { name: 'surface', label: 'Surface habitable (m²)', type: 'number', required: false },
      { name: 'rooms', label: 'Nombre de pièces', type: 'number', required: false },
      { name: 'bedrooms', label: 'Nombre de chambres', type: 'select', required: false, options: BEDROOMS_OPTIONS },
      { name: 'characteristics', label: 'Caractéristiques', type: 'multi-select', required: false, options: PROPERTY_CHARACTERISTICS },
      { name: 'outdoor', label: 'Extérieur', type: 'multi-select', required: false, options: PROPERTY_EXTERIOR },
      { name: 'parking', label: 'Places de parking', type: 'select', required: false, options: PARKING_OPTIONS },
      { name: 'rental_charges', label: 'Charges locatives (€)', type: 'number', required: true },
      { name: 'deposit', label: 'Dépôt de garantie (€)', type: 'number', required: false },
      { name: 'energy_class', label: 'Classe énergie', type: 'select', required: false, options: ENERGY_CLASSES },
      { name: 'ges', label: 'GES', type: 'select', required: false, options: GES_OPTIONS },
    ],
  },
  {
    value: 'locations_saisonnieres',
    label: 'Locations saisonnières',
    icon: 'Palmtree',
    group: 'immobilier',
    fields: [
      { name: 'lodging_nature', label: 'Nature du logement', type: 'select', required: true, options: [
        { value: 'maison', label: 'Maison' }, { value: 'appartement', label: 'Appartement' },
        { value: 'chambre', label: 'Chambre' }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'lodging_type', label: 'Type de logement', type: 'select', required: false, options: [
        { value: 'entier', label: 'Logement entier' }, { value: 'chambre_privee', label: 'Chambre privée' },
        { value: 'chambre_partagee', label: 'Chambre partagée' },
      ]},
      { name: 'capacity', label: 'Capacité (personnes)', type: 'number', required: true },
      { name: 'bedrooms', label: 'Nombre de chambres', type: 'select', required: false, options: BEDROOMS_OPTIONS },
      { name: 'surface', label: 'Surface (m²)', type: 'number', required: false },
      { name: 'outdoor', label: 'Extérieur', type: 'multi-select', required: false, options: PROPERTY_EXTERIOR },
    ],
  },
  {
    value: 'bureaux_commerces',
    label: 'Bureaux & Commerces',
    icon: 'Building',
    group: 'immobilier',
    hasProMode: true,
    fields: [
      { name: 'property_type', label: 'Type de bien', type: 'select', required: false, options: [
        { value: 'bureau', label: 'Bureau' }, { value: 'commerce', label: 'Commerce' },
        { value: 'local', label: 'Local' }, { value: 'entrepot', label: 'Entrepôt' },
      ]},
      { name: 'surface', label: 'Surface (m²)', type: 'number', required: false },
      { name: 'transaction_type', label: 'Type de transaction', type: 'select', required: false, options: [
        { value: 'vente', label: 'Vente' }, { value: 'location', label: 'Location' },
      ]},
    ],
  },

  // ==================== MULTIMÉDIA ====================
  {
    value: 'ordinateurs',
    label: 'Ordinateurs',
    icon: 'Monitor',
    group: 'multimedia',
    hasShipping: true,
    fields: [
      { name: 'computer_type', label: 'Type', type: 'select', required: true, apiName: 'attributes.computer_type', options: COMPUTER_TYPE },
      { name: 'usage', label: 'Usage', type: 'select', required: false, apiName: 'attributes.usage', options: COMPUTER_USAGE },
      { name: 'brand', label: 'Marque', type: 'select', required: false, apiName: 'attributes.brand', options: TECH_BRANDS },
      { name: 'manufacturing_year', label: 'Année de fabrication', type: 'text', required: false, apiName: 'attributes.manufacturing_year', placeholder: 'AAAA' },
      { name: 'condition', label: 'État', type: 'select', required: true, apiName: 'attributes.condition', options: ITEM_STATES },
    ],
  },
  {
    value: 'telephones',
    label: 'Téléphones & Objets connectés',
    icon: 'Smartphone',
    group: 'multimedia',
    hasShipping: true,
    fields: [
      { name: 'product', label: 'Produit', type: 'select', required: true, apiName: 'attributes.product', options: PHONE_PRODUCTS },
      { name: 'brand', label: 'Marque', type: 'select', required: false, apiName: 'attributes.brand', options: PHONE_BRANDS },
      { name: 'color', label: 'Couleur', type: 'select', required: false, apiName: 'attributes.color', options: COLORS },
      { name: 'storage', label: 'Capacité de stockage', type: 'select', required: false, apiName: 'attributes.storage', options: STORAGE_OPTIONS },
      { name: 'manufacturing_year', label: 'Année de fabrication', type: 'text', required: false, apiName: 'attributes.manufacturing_year', placeholder: 'AAAA' },
      { name: 'condition', label: 'État', type: 'select', required: true, apiName: 'attributes.condition', options: ITEM_STATES },
    ],
  },
  {
    value: 'accessoires_telephone',
    label: 'Accessoires téléphone & Objets connectés',
    icon: 'Cable',
    group: 'multimedia',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'tablettes_liseuses',
    label: 'Tablettes & Liseuses',
    icon: 'Tablet',
    group: 'multimedia',
    hasShipping: true,
    fields: [
      { name: 'brand', label: 'Marque', type: 'select', required: false, options: TECH_BRANDS },
      { name: 'storage', label: 'Capacité de stockage', type: 'select', required: false, options: STORAGE_OPTIONS },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'accessoires_informatique',
    label: 'Accessoires informatique',
    icon: 'Mouse',
    group: 'multimedia',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'photo_audio_video',
    label: 'Photo, audio & vidéo',
    icon: 'Camera',
    group: 'multimedia',
    hasShipping: true,
    fields: [
      { name: 'product_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'appareil_photo', label: 'Appareil photo' }, { value: 'camescope', label: 'Caméscope' },
        { value: 'drone', label: 'Drone' }, { value: 'casque', label: 'Casque / Écouteurs' },
        { value: 'enceinte', label: 'Enceinte' }, { value: 'home_cinema', label: 'Home cinéma' },
        { value: 'tv', label: 'Télévision' }, { value: 'accessoire', label: 'Accessoire' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'consoles',
    label: 'Consoles',
    icon: 'Gamepad2',
    group: 'multimedia',
    hasShipping: true,
    fields: [
      { name: 'console_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'playstation', label: 'PlayStation' }, { value: 'xbox', label: 'Xbox' },
        { value: 'nintendo', label: 'Nintendo' }, { value: 'retro', label: 'Rétro' },
        { value: 'portable', label: 'Console portable' }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'jeux_video',
    label: 'Jeux vidéo',
    icon: 'Disc',
    group: 'multimedia',
    hasShipping: true,
    fields: [
      { name: 'platform', label: 'Plateforme', type: 'select', required: false, options: [
        { value: 'playstation', label: 'PlayStation' }, { value: 'xbox', label: 'Xbox' },
        { value: 'nintendo', label: 'Nintendo' }, { value: 'pc', label: 'PC' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },

  // ==================== MAISON ====================
  {
    value: 'ameublement',
    label: 'Ameublement',
    icon: 'Sofa',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'furniture_type', label: 'Type', type: 'select', required: true, apiName: 'attributes.furniture_type', options: FURNITURE_TYPE },
      { name: 'room', label: 'Pièce', type: 'select', required: false, apiName: 'attributes.room', options: FURNITURE_ROOM },
      { name: 'weight', label: 'Poids (kg)', type: 'text', required: false, apiName: 'attributes.weight' },
      { name: 'brand', label: 'Marque', type: 'select', required: false, apiName: 'attributes.brand', options: FURNITURE_BRANDS },
      { name: 'material', label: 'Matière', type: 'select', required: false, apiName: 'attributes.material', options: FURNITURE_MATERIALS },
      { name: 'color', label: 'Couleur', type: 'select', required: false, apiName: 'attributes.color', options: FURNITURE_COLORS },
      { name: 'condition', label: 'État', type: 'select', required: false, apiName: 'attributes.condition', options: ITEM_STATES },
    ],
  },
  {
    value: 'electromenager',
    label: 'Électroménager',
    icon: 'Refrigerator',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'appliance_type', label: 'Type', type: 'select', required: true, apiName: 'attributes.appliance_type', options: APPLIANCE_TYPE },
      { name: 'brand', label: 'Marque', type: 'select', required: false, apiName: 'attributes.brand', options: APPLIANCE_BRANDS },
      { name: 'color', label: 'Couleur', type: 'select', required: false, apiName: 'attributes.color', options: FURNITURE_COLORS },
      { name: 'manufacturing_year', label: 'Année de fabrication', type: 'text', required: false, apiName: 'attributes.manufacturing_year', placeholder: 'AAAA' },
      { name: 'condition', label: 'État', type: 'select', required: false, apiName: 'attributes.condition', options: ITEM_STATES },
    ],
  },
  {
    value: 'bricolage',
    label: 'Bricolage',
    icon: 'Hammer',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'jardin_plantes',
    label: 'Jardin & Plantes',
    icon: 'Flower',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'product_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'plante', label: 'Plante' }, { value: 'mobilier', label: 'Mobilier de jardin' },
        { value: 'outil', label: 'Outil de jardinage' }, { value: 'decoration', label: 'Décoration' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'decoration',
    label: 'Décoration',
    icon: 'Lamp',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'color', label: 'Couleur', type: 'select', required: false, options: FURNITURE_COLORS },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'linge_maison',
    label: 'Linge de maison',
    icon: 'Shirt',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'arts_table',
    label: 'Arts de la table',
    icon: 'UtensilsCrossed',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },

  // ==================== MODE ====================
  {
    value: 'vetements',
    label: 'Vêtements',
    icon: 'Shirt',
    group: 'mode',
    hasShipping: true,
    fields: [
      { name: 'universe', label: 'Univers', type: 'select', required: true, apiName: 'attributes.universe', options: CLOTHING_UNIVERSE },
      { name: 'clothing_type', label: 'Type de vêtement', type: 'select', required: false, apiName: 'attributes.clothing_type', options: CLOTHING_TYPE },
      { name: 'brand', label: 'Marque', type: 'text', required: false, apiName: 'attributes.brand' },
      { name: 'color', label: 'Couleur', type: 'select', required: false, apiName: 'attributes.color', options: COLORS },
      { name: 'condition', label: 'État', type: 'select', required: false, apiName: 'attributes.condition', options: CLOTHING_CONDITION },
    ],
  },
  {
    value: 'chaussures',
    label: 'Chaussures',
    icon: 'Footprints',
    group: 'mode',
    hasShipping: true,
    fields: [
      { name: 'universe', label: 'Univers', type: 'select', required: false, options: CLOTHING_UNIVERSE },
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'size', label: 'Pointure', type: 'text', required: false },
      { name: 'color', label: 'Couleur', type: 'select', required: false, options: COLORS },
      { name: 'condition', label: 'État', type: 'select', required: false, options: CLOTHING_CONDITION },
    ],
  },
  {
    value: 'accessoires_bagagerie',
    label: 'Accessoires & Bagagerie',
    icon: 'Briefcase',
    group: 'mode',
    hasShipping: true,
    fields: [
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'color', label: 'Couleur', type: 'select', required: false, options: COLORS },
      { name: 'condition', label: 'État', type: 'select', required: false, options: CLOTHING_CONDITION },
    ],
  },
  {
    value: 'montres_bijoux',
    label: 'Montres & Bijoux',
    icon: 'Watch',
    group: 'mode',
    hasShipping: true,
    fields: [
      { name: 'product_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'montre', label: 'Montre' }, { value: 'bracelet', label: 'Bracelet' },
        { value: 'collier', label: 'Collier' }, { value: 'bague', label: 'Bague' },
        { value: 'boucles', label: "Boucles d'oreilles" }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'material', label: 'Matière', type: 'select', required: false, options: [
        { value: 'or', label: 'Or' }, { value: 'argent', label: 'Argent' },
        { value: 'platine', label: 'Platine' }, { value: 'acier', label: 'Acier' },
        { value: 'fantaisie', label: 'Fantaisie' }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'vetements_bebe',
    label: 'Vêtements bébé',
    icon: 'Baby',
    group: 'mode',
    hasShipping: true,
    fields: [
      { name: 'age', label: 'Âge', type: 'text', required: false, placeholder: 'Ex: 0-3 mois' },
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'color', label: 'Couleur', type: 'select', required: false, options: COLORS },
      { name: 'condition', label: 'État', type: 'select', required: false, options: CLOTHING_CONDITION },
    ],
  },

  // ==================== LOISIRS ====================
  {
    value: 'sport_plein_air',
    label: 'Sport & Plein air',
    icon: 'Dumbbell',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'sport_type', label: 'Sport', type: 'select', required: false, options: [
        { value: 'fitness', label: 'Fitness' }, { value: 'running', label: 'Running' },
        { value: 'football', label: 'Football' }, { value: 'tennis', label: 'Tennis' },
        { value: 'ski', label: 'Ski / Snowboard' }, { value: 'natation', label: 'Natation' },
        { value: 'randonnee', label: 'Randonnée' }, { value: 'camping', label: 'Camping' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'jeux_jouets',
    label: 'Jeux & Jouets',
    icon: 'Puzzle',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'age', label: 'Âge recommandé', type: 'text', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'instruments_musique',
    label: 'Instruments de musique',
    icon: 'Music',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'instrument_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'guitare', label: 'Guitare' }, { value: 'piano', label: 'Piano / Clavier' },
        { value: 'batterie', label: 'Batterie' }, { value: 'vent', label: 'Instrument à vent' },
        { value: 'cordes', label: 'Instrument à cordes' }, { value: 'dj', label: 'DJ / Studio' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'livres',
    label: 'Livres',
    icon: 'Book',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'genre', label: 'Genre', type: 'select', required: false, options: [
        { value: 'roman', label: 'Roman' }, { value: 'bd', label: 'BD / Comics / Manga' },
        { value: 'jeunesse', label: 'Jeunesse' }, { value: 'scolaire', label: 'Scolaire' },
        { value: 'pratique', label: 'Pratique / Loisirs' }, { value: 'art', label: 'Art / Culture' },
        { value: 'sciences', label: 'Sciences' }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'cd_musique',
    label: 'CD - Musique',
    icon: 'Disc3',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'genre', label: 'Genre', type: 'text', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'dvd_films',
    label: 'DVD - Films',
    icon: 'Film',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'genre', label: 'Genre', type: 'text', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'collection',
    label: 'Collection',
    icon: 'Trophy',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'collection_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'timbres', label: 'Timbres' }, { value: 'pieces', label: 'Pièces / Monnaies' },
        { value: 'cartes', label: 'Cartes' }, { value: 'figurines', label: 'Figurines' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'antiquites',
    label: 'Antiquités',
    icon: 'Clock',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'period', label: 'Époque', type: 'text', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'modelisme',
    label: 'Modélisme',
    icon: 'Plane',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'model_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'avion', label: 'Avion' }, { value: 'voiture', label: 'Voiture' },
        { value: 'bateau', label: 'Bateau' }, { value: 'train', label: 'Train' },
        { value: 'drone', label: 'Drone' }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'loisirs_creatifs',
    label: 'Loisirs créatifs',
    icon: 'Palette',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'vins_gastronomie',
    label: 'Vins & Gastronomie',
    icon: 'Wine',
    group: 'loisirs',
    hasShipping: true,
    fields: [
      { name: 'product_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'vin', label: 'Vin' }, { value: 'champagne', label: 'Champagne' },
        { value: 'spiritueux', label: 'Spiritueux' }, { value: 'gastronomie', label: 'Gastronomie' },
        { value: 'autre', label: 'Autre' },
      ]},
    ],
  },
  {
    value: 'billetterie',
    label: 'Billetterie',
    icon: 'Ticket',
    group: 'loisirs',
    fields: [
      { name: 'event_type', label: "Type d'événement", type: 'select', required: false, options: [
        { value: 'concert', label: 'Concert' }, { value: 'spectacle', label: 'Spectacle' },
        { value: 'sport', label: 'Sport' }, { value: 'festival', label: 'Festival' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'event_date', label: "Date de l'événement", type: 'text', required: false },
    ],
  },
  {
    value: 'evenements',
    label: 'Évènements',
    icon: 'Calendar',
    group: 'loisirs',
    fields: [
      { name: 'event_type', label: "Type d'événement", type: 'text', required: false },
    ],
  },

  // ==================== FAMILLE ====================
  {
    value: 'equipement_bebe',
    label: 'Équipement bébé',
    icon: 'Baby',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'product_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'poussette', label: 'Poussette' }, { value: 'siege_auto', label: 'Siège auto' },
        { value: 'lit', label: 'Lit / Berceau' }, { value: 'chaise_haute', label: 'Chaise haute' },
        { value: 'repas', label: 'Repas / Alimentation' }, { value: 'bain', label: 'Bain' },
        { value: 'eveil', label: 'Éveil' }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'brand', label: 'Marque', type: 'text', required: false },
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'mobilier_enfant',
    label: 'Mobilier enfant',
    icon: 'Bed',
    group: 'maison',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },

  // ==================== ANIMAUX ====================
  {
    value: 'animaux',
    label: 'Animaux',
    icon: 'PawPrint',
    group: 'divers',
    fields: [
      { name: 'animal_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'chien', label: 'Chien' }, { value: 'chat', label: 'Chat' },
        { value: 'oiseau', label: 'Oiseau' }, { value: 'rongeur', label: 'Rongeur' },
        { value: 'poisson', label: 'Poisson' }, { value: 'reptile', label: 'Reptile' },
        { value: 'cheval', label: 'Cheval' }, { value: 'autre', label: 'Autre' },
      ]},
      { name: 'age', label: 'Âge', type: 'text', required: false },
    ],
  },
  {
    value: 'accessoires_animaux',
    label: 'Accessoires animaux',
    icon: 'Dog',
    group: 'divers',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'animaux_perdus',
    label: 'Animaux perdus',
    icon: 'Search',
    group: 'divers',
    fields: [
      { name: 'animal_type', label: 'Type', type: 'select', required: false, options: [
        { value: 'chien', label: 'Chien' }, { value: 'chat', label: 'Chat' },
        { value: 'autre', label: 'Autre' },
      ]},
      { name: 'status', label: 'Statut', type: 'select', required: false, options: [
        { value: 'perdu', label: 'Perdu' }, { value: 'trouve', label: 'Trouvé' },
      ]},
    ],
  },

  // ==================== MATÉRIEL PROFESSIONNEL ====================
  {
    value: 'equipements_industriels',
    label: 'Équipements industriels',
    icon: 'Factory',
    group: 'materiel_pro',
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'materiel_agricole',
    label: 'Matériel agricole',
    icon: 'Tractor',
    group: 'materiel_pro',
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'manutention_levage',
    label: 'Manutention - Levage',
    icon: 'Container',
    group: 'materiel_pro',
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'btp_chantier',
    label: 'BTP - Chantier gros-oeuvre',
    icon: 'HardHat',
    group: 'materiel_pro',
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'equipements_restaurants_hotels',
    label: 'Équipements pour restaurants & hôtels',
    icon: 'Utensils',
    group: 'materiel_pro',
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'equipements_bureau',
    label: 'Équipements & Fournitures de bureau',
    icon: 'Printer',
    group: 'materiel_pro',
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'equipements_commerces_marches',
    label: 'Équipements pour commerces & marchés',
    icon: 'Store',
    group: 'materiel_pro',
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'materiel_medical',
    label: 'Matériel médical',
    icon: 'Stethoscope',
    group: 'materiel_pro',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
  {
    value: 'papeterie_fournitures_scolaires',
    label: 'Papeterie & Fournitures scolaires',
    icon: 'Pencil',
    group: 'materiel_pro',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },

  // ==================== SERVICES ====================
  {
    value: 'autres_services',
    label: 'Autres services',
    icon: 'Wrench',
    group: 'services',
    fields: [
      { name: 'service_type', label: 'Type de service', type: 'text', required: false },
    ],
  },
  {
    value: 'cours_particuliers',
    label: 'Cours particuliers',
    icon: 'GraduationCap',
    group: 'services',
    fields: [
      { name: 'subject', label: 'Matière', type: 'text', required: false },
      { name: 'level', label: 'Niveau', type: 'text', required: false },
    ],
  },
  {
    value: 'services_demenagement',
    label: 'Services de déménagement',
    icon: 'Package',
    group: 'services',
    fields: [
      { name: 'service_type', label: 'Type de service', type: 'select', required: false, options: [
        { value: 'demenagement', label: 'Déménagement complet' },
        { value: 'transport', label: 'Transport seul' },
        { value: 'montage', label: 'Montage / Démontage' },
        { value: 'autre', label: 'Autre' },
      ]},
    ],
  },
  {
    value: 'services_reparations_electroniques',
    label: 'Services de réparations électroniques',
    icon: 'Wrench',
    group: 'services',
    fields: [],
  },
  {
    value: 'services_jardinerie_bricolage',
    label: 'Services de jardinerie & bricolage',
    icon: 'Shovel',
    group: 'services',
    fields: [],
  },
  {
    value: 'services_evenementiels',
    label: 'Services évènementiels',
    icon: 'PartyPopper',
    group: 'services',
    fields: [
      { name: 'service_type', label: 'Type de service', type: 'text', required: false },
    ],
  },
  {
    value: 'services_personne',
    label: 'Services à la personne',
    icon: 'HeartHandshake',
    group: 'services',
    fields: [
      { name: 'service_type', label: 'Type de service', type: 'text', required: false },
    ],
  },
  {
    value: 'baby_sitting',
    label: 'Baby-Sitting',
    icon: 'Baby',
    group: 'services',
    fields: [
      { name: 'availability', label: 'Disponibilité', type: 'text', required: false },
    ],
  },
  {
    value: 'artistes_musiciens',
    label: 'Artistes & Musiciens',
    icon: 'Music2',
    group: 'services',
    fields: [
      { name: 'specialty', label: 'Spécialité', type: 'text', required: false },
    ],
  },
  {
    value: 'services_animaux',
    label: 'Services aux animaux',
    icon: 'Dog',
    group: 'services',
    fields: [
      { name: 'service_type', label: 'Type de service', type: 'select', required: false, options: [
        { value: 'garde', label: 'Garde' }, { value: 'promenade', label: 'Promenade' },
        { value: 'toilettage', label: 'Toilettage' }, { value: 'education', label: 'Éducation' },
        { value: 'autre', label: 'Autre' },
      ]},
    ],
  },
  {
    value: 'entraide_voisins',
    label: 'Entraide entre voisins',
    icon: 'Users',
    group: 'services',
    fields: [],
  },
  {
    value: 'covoiturage',
    label: 'Covoiturage',
    icon: 'Car',
    group: 'services',
    fields: [
      { name: 'departure', label: 'Départ', type: 'text', required: false },
      { name: 'arrival', label: 'Arrivée', type: 'text', required: false },
      { name: 'date', label: 'Date', type: 'text', required: false },
    ],
  },

  // ==================== DIVERS ====================
  {
    value: 'autres',
    label: 'Autres',
    icon: 'Package',
    group: 'divers',
    hasShipping: true,
    fields: [
      { name: 'condition', label: 'État', type: 'select', required: false, options: ITEM_STATES },
    ],
  },
];

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

/**
 * Récupère une catégorie par sa valeur
 */
export function getCategoryByValue(value: string): Category | undefined {
  return CATEGORIES.find(c => c.value === value);
}

/**
 * Récupère tous les champs d'une catégorie incluant les sous-catégories
 */
export function getAllFields(category: Category, subCategoryValue?: string): FormField[] {
  let fields = [...category.fields];
  
  if (subCategoryValue && category.subCategories) {
    const subCategory = category.subCategories.find(sc => sc.value === subCategoryValue);
    if (subCategory) {
      fields = [...fields, ...subCategory.fields];
    }
  }
  
  return fields;
}

/**
 * Récupère les champs conditionnels basés sur les valeurs actuelles
 */
export function getConditionalFields(
  fields: FormField[],
  values: Record<string, string | string[]>
): FormField[] {
  const conditionalFields: FormField[] = [];

  for (const field of fields) {
    if (field.conditionalFields) {
      for (const condition of field.conditionalFields) {
        const fieldValue = values[field.name];
        
        // Vérifier si la condition est remplie
        let conditionMet = false;
        if (Array.isArray(condition.parentValue)) {
          conditionMet = condition.parentValue.includes(fieldValue as string);
        } else {
          conditionMet = fieldValue === condition.parentValue;
        }

        if (conditionMet) {
          conditionalFields.push(...condition.fields);
        }
      }
    }
  }

  return conditionalFields;
}

/**
 * Valide les champs requis
 */
export function validateRequiredFields(
  fields: FormField[],
  values: Record<string, string | string[]>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const field of fields) {
    if (field.required) {
      const value = values[field.name];
      if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
        errors.push(`Le champ "${field.label}" est requis`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Récupère les catégories par groupe
 */
export function getCategoriesByGroup(group: Category['group']): Category[] {
  return CATEGORIES.filter(c => c.group === group);
}

/**
 * Recherche des catégories par nom
 */
export function searchCategories(query: string): Category[] {
  const lowerQuery = query.toLowerCase();
  return CATEGORIES.filter(c => c.label.toLowerCase().includes(lowerQuery));
}
