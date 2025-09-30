<?php

namespace App\Exports;

use App\Models\RefExamSchedule;
use App\Models\StudentExam;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentEntranceExamReportExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    private $fullname = "TRIM(CONCAT_WS(' ', IF(lastname IS NOT NULL AND lastname != '', CONCAT(lastname, ', '), ''), firstname, IF(middlename='', NULL, middlename), IF(name_ext='', NULL, name_ext)))";

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $fullname = "SELECT (SELECT " . $this->fullname . " FROM `profiles` WHERE `profiles`.id = student_academics.profile_id ) FROM student_academics WHERE student_academics.id = student_exams.student_academic_id";

        return StudentExam::select([
            // DB::raw("(SELECT (CONCAT(sy_from,'-',sy_to)) FROM ref_exam_schedules where ref_exam_schedules.id = student_exams.exam_schedule_id) school_year"),
            // DB::raw("(SELECT (SELECT semester FROM ref_semesters WHERE ref_semesters.id=ref_exam_schedules.semester_id) FROM ref_exam_schedules WHERE ref_exam_schedules.id = student_exams.exam_schedule_id) semester"),
            DB::raw("(SELECT CONCAT( CONCAT ( DATE_FORMAT(exam_date, '%M %d, %Y '), ' ', sy_from, '-', sy_to ), ' (', CONCAT( time_in, ' ', time_in_meridiem, '-', time_out, ' ', time_out_meridiem, ')' )) FROM ref_exam_schedules WHERE ref_exam_schedules.id = student_exams.exam_schedule_id) exam_schedule"),

            DB::raw("(SELECT student_status FROM student_academics WHERE student_academics.id = student_exams.student_academic_id LIMIT 1) student_status"),
            DB::raw("(SELECT (SELECT school_level FROM ref_school_levels WHERE ref_school_levels.id = student_academics.student_level_id) FROM student_academics WHERE student_academics.id = student_exams.student_academic_id LIMIT 1) student_level_id"),
            DB::raw("(SELECT category FROM student_exams LIMIT 1) category"),
            DB::raw("($fullname) fullname"),
            DB::raw("(SELECT (SELECT (SELECT (SELECT email FROM users WHERE users.id = `profiles`.user_id) FROM `profiles` WHERE `profiles`.id = student_academics.profile_id ) FROM student_academics WHERE student_academics.id = student_exams.student_academic_id) email"),
        ])->with(['ref_exam_schedules',])
            ->get();
    }

    public function headings(): array
    {
        $schoolYearActive = RefExamSchedule::where('status', 1)->first();

        $from = "";
        $to = "";

        if ($schoolYearActive) {
            $from = $schoolYearActive->sy_from;
            $to = $schoolYearActive->sy_to;
        }

        $data = [
            [
                'FATHER SATURNINO URIOS UNIVERSITY',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                ''
            ],
            [
                'Butuan City, Caraga, Philippines',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                ''
            ],
            [],
            [
                'Student Entrance Exam Report',
            ],
            [
                'First Semester, School Year ' . ($from) . '-' . (($to))
            ],
            [],
        ];


        $data[] = [
            'School Year',
            'Semester',
            'Exam Schedule',
            'Student Status',
            'Student Level',
            'Category',
            'Name',
            'Email',
        ];

        $data[] = [];

        return $data;
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->mergeCells('A1:H1'); // Merge cells from A1 to H1
        $sheet->getStyle('A1:H1')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
        ]);
        $sheet->mergeCells('A2:H2'); // Merge cells from A2 to H2
        $sheet->getStyle('A2:H2')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A2:H2')->applyFromArray([
            'font' => [
                // 'bold' => true,
                'size' => 12,
            ],
        ]);
        $sheet->mergeCells('A4:H4'); // Merge cells from A4 to H4
        $sheet->getStyle('A4:H4')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A4:H4')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
        ]);
        $sheet->mergeCells('A5:H5'); // Merge cells from A5 to H5
        $sheet->getStyle('A5:H5')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A5:H5')->applyFromArray([
            'font' => [
                // 'bold' => true,
                'size' => 12,
            ],
        ]);
        // $sheet->mergeCells('A7:H7'); // Merge cells from A7 to H7
        $sheet->getStyle('A7:H7')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A7:H7')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
        ]);
    }
}