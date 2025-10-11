import { AppDataSource } from "src/data-source/data-source";
import DealerTierSeeder from "src/seeder/dealer-tier.seeder";

AppDataSource.initialize()
  .then(async () => {
    const seeder = new DealerTierSeeder();
    await seeder.run(AppDataSource);
    await AppDataSource.destroy();
    console.log('✅ Dealer tiers seeded!');
  })
  .catch((err) => console.error(err));
