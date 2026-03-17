<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        Enrollment::create(['student_id' => 1, 'course_id' => 1]);
        Enrollment::create(['student_id' => 2, 'course_id' => 2]);
        Enrollment::create(['student_id' => 3, 'course_id' => 3]);
    }
}
