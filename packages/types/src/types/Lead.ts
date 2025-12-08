// packages/types/src/lead.ts

export interface VehicleRegistration {
  DateOfLastUpdate?: string;
  Colour?: string;
  VehicleClass?: string;
  CertificateOfDestructionIssued?: boolean;
  EngineNumber?: string;
  EngineCapacity?: string;
  TransmissionCode?: string;
  Exported?: boolean;
  YearOfManufacture?: string;
  WheelPlan?: string;
  DateExported?: string | null;
  Scrapped?: boolean;
  Transmission?: string;
  DateFirstRegisteredUk?: string;
  Model?: string;
  GearCount?: number;
  ImportNonEu?: boolean;
  PreviousVrmGb?: string | null;
  GrossWeight?: number;
  DoorPlanLiteral?: string;
  MvrisModelCode?: string;
  Vin?: string;
  Vrm?: string;
  DateFirstRegistered?: string;
  DateScrapped?: string | null;
  DoorPlan?: string;
  YearMonthFirstRegistered?: string;
  VinLast5?: string;
  VehicleUsedBeforeFirstRegistration?: boolean;
  MaxPermissibleMass?: number;
  Make?: string;
  MakeModel?: string;
  TransmissionType?: string;
  SeatingCapacity?: number;
  FuelType?: string;
  Co2Emissions?: number;
  Imported?: boolean;
  MvrisMakeCode?: string;
  PreviousVrmNi?: string | null;
  VinConfirmationFlag?: string | null;
}

export interface Dimensions {
  UnladenWeight?: number;
  RigidArtic?: string;
  BodyShape?: string;
  PayloadVolume?: number | null;
  PayloadWeight?: number | null;
  Height?: number;
  NumberOfDoors?: number;
  NumberOfSeats?: number;
  KerbWeight?: number;
  GrossTrainWeight?: number | null;
  FuelTankCapacity?: number;
  LoadLength?: number | null;
  DataVersionNumber?: number | null;
  WheelBase?: number;
  CarLength?: number;
  Width?: number;
  NumberOfAxles?: number;
  GrossVehicleWeight?: number;
  GrossCombinedWeight?: number | null;
}

export interface Engine {
  FuelCatalyst?: string;
  Stroke?: number;
  PrimaryFuelFlag?: string;
  ValvesPerCylinder?: number;
  Aspiration?: string;
  FuelSystem?: string;
  NumberOfCylinders?: number;
  CylinderArrangement?: string;
  ValveGear?: string;
  Location?: string;
  Description?: string | null;
  Bore?: number;
  Make?: string;
  FuelDelivery?: string;
}

export interface Performance {
  Torque?: {
    FtLb?: number;
    Nm?: number;
    Rpm?: number;
  };
  NoiseLevel?: number | null;
  DataVersionNumber?: number | null;
  Power?: {
    Bhp?: number;
    Rpm?: number;
    Kw?: number;
  };
  MaxSpeed?: {
    Kph?: number;
    Mph?: number;
  };
  Co2?: number;
  Particles?: number | null;
  Acceleration?: {
    Mph?: number;
    Kph?: number;
    ZeroTo60Mph?: number;
    ZeroTo100Kph?: number;
  };
}

export interface Consumption {
  ExtraUrban?: {
    Lkm?: number;
    Mpg?: number;
  };
  UrbanCold?: {
    Lkm?: number;
    Mpg?: number;
  };
  Combined?: {
    Lkm?: number;
    Mpg?: number;
  };
}

export interface VehicleHistory {
  V5CCertificateCount?: number;
  PlateChangeCount?: number;
  NumberOfPreviousKeepers?: number;
  V5CCertificateList?: Array<{
    CertificateDate?: string;
  }>;
  KeeperChangesCount?: number;
  VicCount?: number;
  ColourChangeCount?: number | null;
  ColourChangeList?: any;
  KeeperChangesList?: any;
  PlateChangeList?: Array<{
    CurrentVRM?: string;
    TransferType?: string;
    DateOfReceipt?: string;
    PreviousVRM?: string;
    DateOfTransaction?: string;
  }>;
  VicList?: any;
  ColourChangeDetails?: {
    CurrentColour?: string;
    NumberOfPreviousColours?: number;
    OriginalColour?: string | null;
    LastColour?: string | null;
    DateOfLastColourChange?: string | null;
  };
}

export interface SmmtDetails {
  Range?: string;
  FuelType?: string;
  EngineCapacity?: string;
  MarketSectorCode?: string;
  CountryOfOrigin?: string;
  ModelCode?: string;
  ModelVariant?: string;
  DataVersionNumber?: number | null;
  NumberOfGears?: number;
  NominalEngineCapacity?: number;
  MarqueCode?: string;
  Transmission?: string;
  BodyStyle?: string;
  VisibilityDate?: string;
  SysSetupDate?: string;
  Marque?: string;
  CabType?: string;
  TerminateDate?: string;
  Series?: string;
  NumberOfDoors?: number;
  DriveType?: string;
}

export interface VedRate {
  Standard?: {
    SixMonth?: number;
    TwelveMonth?: number;
  };
  VedCo2Emissions?: number;
  vedBand?: string;
  VedCo2Band?: string;
}

export interface General {
  PowerDelivery?: string;
  TypeApprovalCategory?: string;
  SeriesDescription?: string;
  DriverPosition?: string;
  DrivingAxle?: string;
  DataVersionNumber?: number | null;
  EuroStatus?: string;
  IsLimitedEdition?: boolean;
}

export interface VehicleDetails {
  id: number;
  vehicleRegistration: VehicleRegistration;
  dimensions?: Dimensions;
  engine?: Engine;
  performance?: Performance;
  consumption?: Consumption;
  vehicleHistory?: VehicleHistory;
  smmtDetails?: SmmtDetails;
  vedRate?: VedRate;
  general?: General;
  createdAt: string;
  updatedAt: string;
  leadId: number;
}

export interface Lead {
  id: number;
  number: string;
  vehicle_model?: string;
  vehicle_reg?: string;
  vehicle_brand?: string;
  vehicle_title?: string;
  vehicle_vrm?: string;
  vehicle_series?: string;
  vehicle_part?: string;
  engin_capacity?: string;
  fuelType?: string;
  part_supplied?: string;
  supply_only?: string;
  consider_both?: string;
  reconditioned_condition?: string;
  used_condition?: string;
  new_condition?: string;
  consider_all_condition?: string;
  postcode?: string;
  vehicle_drive?: string;
  collection_required?: string;
  email?: string;
  name?: string;
  description?: string;
  engine_code?: string;
  source?: string;
  status?: string;
  assigned_to?: string;
  follow_up_date?: Date;
  notes?: string;
  wonByDealerId?: number;
  moreInfoFetched?: boolean;
  isHqLead?: boolean;
  vehicleDetails?: VehicleDetails;
  createdAt?: string;
  updatedAt?: string;
}
