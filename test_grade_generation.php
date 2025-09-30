<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Contracts\Http\Kernel;
use App\Models\Profile;
use App\Models\User;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\SchoolYear;

// Boot Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

// Test the grade generation
echo "Testing grade generation...\n\n";

// Get counts before
$profileCountBefore = Profile::count();
$gradeCountBefore = Grade::count();
$subjectCount = Subject::count();
$schoolYearCount = SchoolYear::count();

echo "Before:\n";
echo "Profiles: $profileCountBefore\n";
echo "Grades: $gradeCountBefore\n";
echo "Subjects: $subjectCount\n";
echo "School Years: $schoolYearCount\n\n";

// Create a test user first (we need one for auth simulation)
$testUser = User::create([
    'user_role_id' => 1,
    'username' => 'testuser' . time(),
    'email' => 'test' . time() . '@example.com',
    'password' => bcrypt('password'),
    'created_by' => 1,
    'status' => 'Active'
]);

echo "Created test user with ID: {$testUser->id}\n";

// Create a test profile
$testProfile = Profile::create([
    'user_id' => $testUser->id,
    'school_id' => '2022-123456',
    'firstname' => 'Test',
    'lastname' => 'Student',
    'gender' => 'Male',
    'created_by' => 1
]);

echo "Created test profile with ID: {$testProfile->id}\n";

// Simulate the grade generation manually
$subjects = Subject::all();
$schoolYears = SchoolYear::all();

$gradesData = [];

foreach ($subjects as $subject) {
    // Find matching school year based on semester
    $semesterMap = [
        '1' => '1st Semester',
        '2' => '2nd Semester', 
        'summer' => 'Summer'
    ];
    
    $semesterName = $semesterMap[$subject->semester] ?? '1st Semester';
    $schoolYear = $schoolYears->where('semester', $semesterName)->first();
    
    if ($schoolYear) {
        // Generate random grade between 1.0 and 2.9
        $major = rand(1, 2);
        $minor = rand(0, 9);
        $gradeValue = floatval($major . '.' . $minor);
        
        $gradesData[] = [
            'profile_id' => $testProfile->id,
            'subject_id' => $subject->id,
            'school_year_id' => $schoolYear->id,
            'grade' => $gradeValue,
            'created_by' => $testUser->id,
            'updated_by' => $testUser->id,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }
}

// Batch insert all grades
if (!empty($gradesData)) {
    Grade::insert($gradesData);
    echo "Generated " . count($gradesData) . " grades for profile {$testProfile->id}\n\n";
}

// Get counts after
$profileCountAfter = Profile::count();
$gradeCountAfter = Grade::count();

echo "After:\n";
echo "Profiles: $profileCountAfter (+" . ($profileCountAfter - $profileCountBefore) . ")\n";
echo "Grades: $gradeCountAfter (+" . ($gradeCountAfter - $gradeCountBefore) . ")\n\n";

// Show some sample grades
$sampleGrades = Grade::where('profile_id', $testProfile->id)
    ->with(['subject', 'schoolYear'])
    ->take(10)
    ->get();

echo "Sample grades for profile {$testProfile->id}:\n";
foreach ($sampleGrades as $grade) {
    echo "Subject: {$grade->subject->subject_name} | Grade: {$grade->grade} | School Year: {$grade->schoolYear->school_year} {$grade->schoolYear->semester}\n";
}

echo "\nTest completed successfully!\n";
