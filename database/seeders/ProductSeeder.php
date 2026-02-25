<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'type' => 'transfer',
                'title' => 'Airport Transfer (Istanbul Airport → Hotel)',
                'title_fr' => 'Transfert Aeroport (Istanbul Aeroport → Hotel)',
                'description' => 'Private airport transfer with meet & greet service',
                'description_fr' => 'Transfert prive aeroport avec service d\'accueil',
                'price_dzd' => 5000,
                'price_eur' => 33.50,
                'cost_dzd' => 3000,
                'duration' => '45 min',
                'supplier_name' => 'Istanbul Transfer Co.',
                'supplier_commission' => 15,
            ],
            [
                'type' => 'transfer',
                'title' => 'Round-trip Airport Transfer',
                'title_fr' => 'Transfert Aeroport Aller-Retour',
                'description' => 'Round-trip private transfer between Istanbul Airport and hotel',
                'description_fr' => 'Transfert prive aller-retour entre l\'aeroport et l\'hotel',
                'price_dzd' => 8500,
                'price_eur' => 56.95,
                'cost_dzd' => 5500,
                'duration' => '45 min each way',
                'supplier_name' => 'Istanbul Transfer Co.',
                'supplier_commission' => 15,
            ],
            [
                'type' => 'excursion',
                'title' => 'Bosphorus Cruise Tour',
                'title_fr' => 'Croisiere sur le Bosphore',
                'description' => 'Full-day Bosphorus cruise with lunch and guided tour',
                'description_fr' => 'Croisiere journee complete sur le Bosphore avec dejeuner et guide',
                'price_dzd' => 7500,
                'price_eur' => 50.25,
                'cost_dzd' => 4500,
                'duration' => 'Full day (8h)',
                'supplier_name' => 'Bosphorus Tours Ltd',
                'supplier_commission' => 20,
            ],
            [
                'type' => 'excursion',
                'title' => 'Old City Walking Tour',
                'title_fr' => 'Visite a Pied de la Vieille Ville',
                'description' => 'Guided tour of Hagia Sophia, Blue Mosque, Topkapi Palace, Grand Bazaar',
                'description_fr' => 'Visite guidee de Sainte-Sophie, Mosquee Bleue, Palais de Topkapi, Grand Bazar',
                'price_dzd' => 6000,
                'price_eur' => 40.20,
                'cost_dzd' => 3500,
                'duration' => 'Half day (5h)',
                'supplier_name' => 'Istanbul Walks',
                'supplier_commission' => 18,
            ],
            [
                'type' => 'excursion',
                'title' => 'Cappadocia Day Trip (by flight)',
                'title_fr' => 'Excursion Cappadoce (en avion)',
                'description' => 'Day trip to Cappadocia including flights, balloon ride, and guided tour',
                'description_fr' => 'Excursion Cappadoce incluant vols, montgolfiere et visite guidee',
                'price_dzd' => 35000,
                'price_eur' => 234.50,
                'cost_dzd' => 25000,
                'duration' => 'Full day (14h)',
                'supplier_name' => 'Cappadocia Adventures',
                'supplier_commission' => 12,
            ],
            [
                'type' => 'pass',
                'title' => 'Istanbul Tourist Pass (5 days)',
                'title_fr' => 'Istanbul Tourist Pass (5 jours)',
                'description' => 'Access to 30+ attractions including Hagia Sophia, Topkapi Palace, Bosphorus Cruise',
                'description_fr' => 'Acces a 30+ attractions dont Sainte-Sophie, Palais de Topkapi, Croisiere Bosphore',
                'price_dzd' => 12000,
                'price_eur' => 80.40,
                'cost_dzd' => 8000,
                'duration' => '5 days',
                'supplier_name' => 'Istanbul Pass Official',
                'supplier_commission' => 10,
            ],
            [
                'type' => 'cruise',
                'title' => 'Dinner Cruise on the Bosphorus',
                'title_fr' => 'Croisiere Diner sur le Bosphore',
                'description' => 'Evening dinner cruise with Turkish entertainment, live music, and belly dancing',
                'description_fr' => 'Croisiere diner en soiree avec spectacle turc, musique live et danse orientale',
                'price_dzd' => 9000,
                'price_eur' => 60.30,
                'cost_dzd' => 5500,
                'duration' => '3 hours',
                'supplier_name' => 'Bosphorus Night Cruises',
                'supplier_commission' => 22,
            ],
            [
                'type' => 'excursion',
                'title' => 'Turkish Bath (Hammam) Experience',
                'title_fr' => 'Experience Bain Turc (Hammam)',
                'description' => 'Traditional Turkish bath experience with massage and scrub',
                'description_fr' => 'Experience bain turc traditionnel avec massage et gommage',
                'price_dzd' => 4500,
                'price_eur' => 30.15,
                'cost_dzd' => 2500,
                'duration' => '2 hours',
                'supplier_name' => 'Historic Hammams Istanbul',
                'supplier_commission' => 25,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['title' => $product['title']],
                $product
            );
        }

        $this->command->info('Seeded ' . count($products) . ' products.');
    }
}
