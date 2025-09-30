<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Contracts\Http\Kernel;
use App\Models\Profile;
use App\Models\User;
use App\Models\Grade;
use App\Http\Controllers\ProfileController;

// Boot Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

echo "Testing ProfileController grade generation integration...\n\n";

// Get counts before
$profileCountBefore = Profile::count();
$gradeCountBefore = Grade::count();

echo "Before:\n";
echo "Profiles: $profileCountBefore\n";
echo "Grades: $gradeCountBefore\n\n";

// Create controller instance
$controller = new ProfileController();

// Create a test user to simulate authenticated user
$testUser = User::create([
    'user_role_id' => 1,
    'username' => 'testprofileuser' . time(),
    'email' => 'testprofile' . time() . '@example.com',
    'password' => bcrypt('password'),
    'created_by' => 1,
    'status' => 'Active'
]);

// Simulate authentication
auth()->login($testUser);

// Simulate profile creation like the actual controller does
$profileData = [
    'user_id' => $testUser->id,
    'school_id' => '2022-' . rand(100000, 999999),
    'firstname' => 'Test',
    'lastname' => 'Profile',
    'gender' => 'Female',
    'created_by' => $testUser->id
];

$createProfile = Profile::create($profileData);

if ($createProfile) {
    $profile_id = $createProfile->id;
    echo "Created profile with ID: $profile_id\n";
    
    // Use reflection to call the private method
    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('generateGradesForProfile');
    $method->setAccessible(true);
    $method->invoke($controller, $profile_id);
    
    echo "Generated grades using ProfileController method\n\n";
}

// Get counts after
$profileCountAfter = Profile::count();
$gradeCountAfter = Grade::count();

echo "After:\n";
echo "Profiles: $profileCountAfter (+" . ($profileCountAfter - $profileCountBefore) . ")\n";
echo "Grades: $gradeCountAfter (+" . ($gradeCountAfter - $gradeCountBefore) . ")\n\n";

// Show some sample grades for the new profile
$sampleGrades = Grade::where('profile_id', $profile_id)
    ->with(['subject', 'schoolYear'])
    ->take(5)
    ->get();

echo "Sample grades for profile $profile_id:\n";
foreach ($sampleGrades as $grade) {
    echo "Subject: {$grade->subject->subject_name} | Grade: {$grade->grade} | School Year: {$grade->schoolYear->school_year} {$grade->schoolYear->semester}\n";
}

// Count grades by semester
$gradesBySemester = Grade::where('profile_id', $profile_id)
    ->join('subjects', 'grades.subject_id', '=', 'subjects.id')
    ->selectRaw('subjects.semester, COUNT(*) as count')
    ->groupBy('subjects.semester')
    ->get();

echo "\nGrades distribution by semester:\n";
foreach ($gradesBySemester as $semesterGrade) {
    $semesterName = $semesterGrade->semester == '1' ? '1st Semester' : 
                   ($semesterGrade->semester == '2' ? '2nd Semester' : 'Summer');
    echo "$semesterName: {$semesterGrade->count} subjects\n";
}

$totalGrades = Grade::where('profile_id', $profile_id)->count();
echo "\nTotal grades generated: $totalGrades\n";

echo "\nProfileController integration test completed successfully!\n";
