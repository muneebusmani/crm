import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lead } from './lead.entity';

@Entity('vehicle_details')
export class VehicleDetails {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'jsonb' })
  vehicleRegistration!: {
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
  };

  @Column({ type: 'jsonb', nullable: true })
  dimensions?: {
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
  };

  @Column({ type: 'jsonb', nullable: true })
  engine?: {
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
  };

  @Column({ type: 'jsonb', nullable: true })
  performance?: {
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
  };

  @Column({ type: 'jsonb', nullable: true })
  consumption?: {
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
  };

  @Column({ type: 'jsonb', nullable: true })
  vehicleHistory?: {
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
  };

  @Column({ type: 'jsonb', nullable: true })
  smmtDetails?: {
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
  };

  @Column({ type: 'jsonb', nullable: true })
  vedRate?: {
    Standard?: {
      SixMonth?: number;
      TwelveMonth?: number;
    };
    VedCo2Emissions?: number;
    vedBand?: string;
    VedCo2Band?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  general?: {
    PowerDelivery?: string;
    TypeApprovalCategory?: string;
    SeriesDescription?: string;
    DriverPosition?: string;
    DrivingAxle?: string;
    DataVersionNumber?: number | null;
    EuroStatus?: string;
    IsLimitedEdition?: boolean;
  };

  @OneToOne(() => Lead, (lead) => lead.vehicleDetails, { onDelete: 'CASCADE' })
  @JoinColumn()
  lead!: Lead;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}