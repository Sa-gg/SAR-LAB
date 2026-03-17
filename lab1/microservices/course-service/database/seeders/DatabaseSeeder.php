<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\CourseSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CourseSeeder::class,
        ]);
    }
}
