<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Contracts\Http\Kernel;
use App\Models\Subject;

// Boot Laravel application
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

echo "Subject Distribution Report:\n\n";

$subjects = Subject::selectRaw('year_level, semester, COUNT(*) as count')
    ->groupBy('year_level', 'semester')
    ->orderBy('year_level')
    ->orderBy('semester')
    ->get();

$totalByYear = [];

foreach ($subjects as $subject) {
    $semesterName = $subject->semester == '1' ? '1st Semester' : 
                   ($subject->semester == '2' ? '2nd Semester' : 'Summer');
    
    echo "Year {$subject->year_level}, {$semesterName}: {$subject->count} subjects\n";
    
    if (!isset($totalByYear[$subject->year_level])) {
        $totalByYear[$subject->year_level] = 0;
    }
    $totalByYear[$subject->year_level] += $subject->count;
}

echo "\nTotal by Year Level:\n";
foreach ($totalByYear as $year => $count) {
    echo "Year $year: $count subjects\n";
}

$totalSubjects = Subject::count();
echo "\nOverall Total: $totalSubjects subjects\n";

// Verify expected distribution
$expected = [
    1 => ['1st' => 9, '2nd' => 11], // 1st Year: 20 subjects
    2 => ['1st' => 10, '2nd' => 11], // 2nd Year: 21 subjects  
    3 => ['1st' => 6, '2nd' => 5, 'summer' => 2], // 3rd Year: 13 subjects
    4 => ['1st' => 5, '2nd' => 1] // 4th Year: 6 subjects
];

echo "\nVerification against expected distribution:\n";
$matches = true;

foreach ($expected as $year => $semesters) {
    $actualYear = $subjects->where('year_level', $year);
    foreach ($semesters as $semester => $expectedCount) {
        $semesterKey = $semester == '1st' ? '1' : ($semester == '2nd' ? '2' : 'summer');
        $actual = $actualYear->where('semester', $semesterKey)->first();
        $actualCount = $actual ? $actual->count : 0;
        
        $status = $actualCount == $expectedCount ? "✓" : "✗";
        echo "$status Year $year, $semester Semester: Expected $expectedCount, Got $actualCount\n";
        
        if ($actualCount != $expectedCount) {
            $matches = false;
        }
    }
}

echo "\nTotal expected: 60 subjects\n";
echo "Total actual: $totalSubjects subjects\n";

if ($matches && $totalSubjects == 60) {
    echo "\n✓ All subjects match expected distribution!\n";
} else {
    echo "\n✗ Subject distribution doesn't match expected values.\n";
}
