<?php

namespace App\Exports;

use App\Models\FacultyLoadMonitoring;
use App\Models\FacultyLoadMonitoringJustification;
use App\Models\RefSchoolYear;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class FacultyLoadReportExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    /**
     * @return \Illuminate\Support\Collection
     */
    private $fullname = "TRIM(CONCAT_WS(' ', IF(lastname IS NOT NULL AND lastname != '', CONCAT(lastname, ', '), ''), firstname, IF(middlename='', NULL, middlename), IF(name_ext='', NULL, name_ext)))";
    private $param1;
    private $param2;
    private $param3;

    public function __construct($param1, $param2, $param3)
    {
        $this->param1 = $param1;
        $this->param2 = $param2;
        $this->param3 = $param3;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $fullname = $this->fullname;
        if ($this->param3 == 'Faculty Load Report') {
            $fullname = "SELECT $fullname FROM profiles WHERE profiles.id = (SELECT profile_id FROM faculty_loads WHERE faculty_loads.id = faculty_load_monitorings.faculty_load_id)";
            return FacultyLoadMonitoring::select([
                DB::raw("DATE_FORMAT(created_at, '%M/%D/%Y') date_created"),
                DB::raw("(SELECT `status` FROM ref_statuses WHERE ref_statuses.id=status_id) status"),
                DB::raw("(SELECT `status` FROM ref_statuses WHERE ref_statuses.id = faculty_load_monitorings.update_status_id) status_justified"),
                "update_remarks",
                DB::raw("($fullname) fullname"),
                DB::raw("(SELECT CONCAT(time_in,'-', time_out, ' ', meridian) FROM faculty_loads WHERE faculty_loads.id = faculty_load_id) `time`"),
                DB::raw("(SELECT room_code FROM ref_rooms WHERE ref_rooms.id = (SELECT room_id FROM faculty_loads WHERE faculty_loads.id = faculty_load_monitorings.faculty_load_id)) room_code"),
                DB::raw("(SELECT code FROM ref_subjects WHERE ref_subjects.id = (SELECT subject_id FROM faculty_loads WHERE faculty_loads.id = faculty_load_monitorings.faculty_load_id)) subject_code"),
                DB::raw("(SELECT CONCAT(`sy_from`, '-', `sy_to`) FROM ref_school_years WHERE ref_school_years.id = (SELECT school_year_id FROM faculty_loads WHERE faculty_loads.id = faculty_load_monitorings.faculty_load_id)) school_year"),
                DB::raw("(SELECT semester FROM ref_semesters WHERE ref_semesters.id = (SELECT semester_id FROM faculty_loads WHERE faculty_loads.id = faculty_load_monitorings.faculty_load_id)) semester"),
            ])
                ->whereDate('created_at', '>=', $this->param1)
                ->where('created_at', '<=', $this->param2)
                ->get();
        } else if ($this->param3 == 'Faculty Load Justification') {
            $status = "SELECT `status` FROM ref_statuses WHERE ref_statuses.id = faculty_load_monitoring_justifications.status_id";
            $fullname = "SELECT $fullname FROM profiles WHERE profiles.id = (SELECT profile_id FROM faculty_loads WHERE faculty_loads.id = (SELECT faculty_load_id FROM faculty_load_monitorings WHERE faculty_load_monitorings.id = faculty_load_monitoring_justifications.faculty_load_monitoring_id))";
            $approved_by_name = "SELECT $fullname FROM profiles WHERE profiles.user_id = (SELECT id FROM users WHERE users.id = faculty_load_monitoring_justifications.approved_by)";
            $remaks_new = "CONCAT(remarks, IF(remarks IS NOT NULL, CONCAT(' / ', remarks2), ''))";
            $date_reported = "SELECT DATE_FORMAT(faculty_load_monitorings.created_at, '%m/%d/%Y') FROM faculty_load_monitorings WHERE faculty_load_monitorings.id = faculty_load_monitoring_id ORDER BY faculty_load_monitorings.id DESC LIMIT 1";
            $time = "SELECT CONCAT(time_in,'-', time_out, ' ', meridian) FROM faculty_loads WHERE faculty_loads.id = (SELECT faculty_load_id FROM faculty_load_monitorings WHERE faculty_load_monitorings.id = faculty_load_monitoring_id ORDER BY faculty_load_monitorings.id DESC LIMIT 1)";

            return FacultyLoadMonitoringJustification::select([
                DB::raw("($status) status"),
                DB::raw("($remaks_new) remaks_new"),
                DB::raw("($fullname) fullname"),
                DB::raw("($approved_by_name) approved_by_name"),
                DB::raw("DATE_FORMAT(date_approved, '%m/%d/%Y') date_approved_format"),
                DB::raw("($date_reported) date_reported"),
                DB::raw("($time) time"),
            ])
                ->whereDate('created_at', '>=', $this->param1)
                ->where('created_at', '<=', $this->param2)
                ->get();
        } else if ($this->param3 == 'Faculty Load Deduction') {
            // $faculty_load = "SELECT id FROM faculty_loads WHERE faculty_loads.id = faculty_load_monitorings.faculty_load_id";
            $status = "SELECT `status` FROM ref_statuses WHERE ref_statuses.id = faculty_load_monitorings.status_id";
            $fullname = "SELECT $fullname FROM profiles WHERE profiles.id = (SELECT profile_id FROM faculty_loads WHERE faculty_loads.id = faculty_load_monitorings.faculty_load_id)";
            $time = "SELECT CONCAT(time_in,'-', time_out, ' ', meridian) FROM faculty_loads WHERE faculty_loads.id = faculty_load_id";
            $created_at_format = "DATE_FORMAT(faculty_load_monitorings.created_at, '%m/%d/%Y')";
            $time_total_absent = "SELECT 
                                DATE_FORMAT(
                                    TIMEDIFF(
                                        STR_TO_DATE(
                                            CONCAT( IF(meridian = 'AM', HOUR(time_out), IF(HOUR(time_out) = 12 , HOUR(time_out), HOUR(time_out) + 12) ),':', MINUTE(time_out) ),
                                            '%H:%i' 
                                        ),
                                        STR_TO_DATE(
                                            CONCAT(
                                                IF(
                                                    (CASE 
                                                        WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >=7 AND HOUR(time_out) < 12 AND meridian = 'AM' THEN 'AM'
                                                        WHEN HOUR(time_in) = 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'PM'
                                                        WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                                        WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                                        WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                                        WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                                        WHEN HOUR(time_in) = 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND meridian = 'PM' THEN 'PM'
                                                        WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'AM'
                                                        ELSE meridian
                                                    END) = 'AM', HOUR(time_in), IF(HOUR(time_in) = 12, HOUR(time_in), HOUR(time_in) + 12)
                                                ),
                                                ':', MINUTE(time_in)
                                            ),
                                            '%H:%i' 
                                        )
                                    ),
                                    '%H:%i'
                                )
                            FROM faculty_loads WHERE faculty_loads.id = faculty_load_id";

            $time_total_absent_decimal = "SELECT 
                            ROUND(
                            (HOUR(TIMEDIFF(
                            STR_TO_DATE(
                                CONCAT( IF(meridian = 'AM', HOUR(time_out), IF(HOUR(time_out) = 12 , HOUR(time_out), HOUR(time_out) + 12) ),':', MINUTE(time_out) ),
                                '%H:%i' 
                            ),
                            STR_TO_DATE(
                                CONCAT(
                                    IF(
                                        (CASE 
                                            WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >=7 AND HOUR(time_out) < 12 AND meridian = 'AM' THEN 'AM'
                                            WHEN HOUR(time_in) = 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'PM'
                                            WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                            WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                            WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                            WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                            WHEN HOUR(time_in) = 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND meridian = 'PM' THEN 'PM'
                                            WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'AM'
                                            ELSE meridian
                                        END) = 'AM', HOUR(time_in), IF(HOUR(time_in) = 12, HOUR(time_in), HOUR(time_in) + 12)
                                    ),
                                    ':', MINUTE(time_in)
                                ),
                                '%H:%i' 
                            )
                        )) + 
                        ( MINUTE(TIMEDIFF(
                            STR_TO_DATE(
                                CONCAT( IF(meridian = 'AM', HOUR(time_out), IF(HOUR(time_out) = 12 , HOUR(time_out), HOUR(time_out) + 12) ),':', MINUTE(time_out) ),
                                '%H:%i' 
                            ),
                            STR_TO_DATE(
                                CONCAT(
                                    IF(
                                        (CASE 
                                            WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >=7 AND HOUR(time_out) < 12 AND meridian = 'AM' THEN 'AM'
                                            WHEN HOUR(time_in) = 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'PM'
                                            WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                            WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                            WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                            WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                            WHEN HOUR(time_in) = 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND meridian = 'PM' THEN 'PM'
                                            WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'AM'
                                            ELSE meridian
                                        END) = 'AM', HOUR(time_in), IF(HOUR(time_in) = 12, HOUR(time_in), HOUR(time_in) + 12)
                                    ),
                                    ':', MINUTE(time_in)
                                ),
                                '%H:%i' 
                            )
                        )) * (1/60) ) ), 2
                        )
                    FROM faculty_loads WHERE faculty_loads.id = faculty_load_id";

            $total_deduction = "IF( rate != '', ( SELECT 
                                                ROUND(
                                                (HOUR(TIMEDIFF(
                                                STR_TO_DATE(
                                                    CONCAT( IF(meridian = 'AM', HOUR(time_out), IF(HOUR(time_out) = 12 , HOUR(time_out), HOUR(time_out) + 12) ),':', MINUTE(time_out) ),
                                                    '%H:%i' 
                                                ),
                                                STR_TO_DATE(
                                                    CONCAT(
                                                        IF(
                                                            (CASE 
                                                                WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >=7 AND HOUR(time_out) < 12 AND meridian = 'AM' THEN 'AM'
                                                                WHEN HOUR(time_in) = 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'PM'
                                                                WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                                                WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                                                WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                                                WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                                                WHEN HOUR(time_in) = 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND meridian = 'PM' THEN 'PM'
                                                                WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'AM'
                                                                ELSE meridian
                                                            END) = 'AM', HOUR(time_in), IF(HOUR(time_in) = 12, HOUR(time_in), HOUR(time_in) + 12)
                                                        ),
                                                        ':', MINUTE(time_in)
                                                    ),
                                                    '%H:%i' 
                                                )
                                            )) + 
                                            ( MINUTE(TIMEDIFF(
                                                STR_TO_DATE(
                                                    CONCAT( IF(meridian = 'AM', HOUR(time_out), IF(HOUR(time_out) = 12 , HOUR(time_out), HOUR(time_out) + 12) ),':', MINUTE(time_out) ),
                                                    '%H:%i' 
                                                ),
                                                STR_TO_DATE(
                                                    CONCAT(
                                                        IF(
                                                            (CASE 
                                                                WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >=7 AND HOUR(time_out) < 12 AND meridian = 'AM' THEN 'AM'
                                                                WHEN HOUR(time_in) = 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'PM'
                                                                WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                                                WHEN HOUR(time_in) >= 1 AND HOUR(time_in) <= 10 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                                                WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) > HOUR(time_out) AND meridian = 'PM' THEN 'AM'
                                                                WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND HOUR(time_in) < HOUR(time_out) AND meridian = 'PM' THEN 'PM'
                                                                WHEN HOUR(time_in) = 12 AND HOUR(time_out) >= 1 AND HOUR(time_out) <= 10 AND meridian = 'PM' THEN 'PM'
                                                                WHEN HOUR(time_in) >= 7 AND HOUR(time_in) < 12 AND HOUR(time_out) = 12 AND meridian = 'PM' THEN 'AM'
                                                                ELSE meridian
                                                            END) = 'AM', HOUR(time_in), IF(HOUR(time_in) = 12, HOUR(time_in), HOUR(time_in) + 12)
                                                        ),
                                                        ':', MINUTE(time_in)
                                                    ),
                                                    '%H:%i' 
                                                )
                                            )) * (1/60) ) ), 2
                                            )
                                        FROM faculty_loads WHERE faculty_loads.id = faculty_load_id ) * rate, '' ) ";

            return FacultyLoadMonitoring::select([
                DB::raw("($fullname) fullname"),
                DB::raw("($time_total_absent) time_total_absent"),
                DB::raw("($time_total_absent_decimal) time_total_absent_decimal"),
                "rate",
                DB::raw("($total_deduction) total_deduction"),
                DB::raw("($created_at_format) created_at_format"),
                DB::raw("($time) time"),
            ])
                ->get();
        }
    }

    public function headings(): array
    {
        $schoolYearActive = RefSchoolYear::where('status', 1)->first();

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
                'Faculty Load Summary'
            ],
            [
                'First Semester, School Year ' . ($from) . '-' . (($to))
            ],
            [],
        ];


        if ($this->param3 == 'Faculty Load Report') {
            $data[] = [
                'Date Created',
                'Status',
                'Justification Status',
                'Justification Remarks',
                'Name',
                'Time',
                'Room',
                'Subject',
                'School Year',
                'Semester'
            ];
        } else if ($this->param3 == 'Faculty Load Justification') {
            $data[] = [
                'Status',
                'Remarks',
                'Name',
                'Approved By',
                'Date Approved',
                'Date Scheduled',
                'Time Scheduled',
            ];
        } else if ($this->param3 == 'Faculty Load Deduction') {
            $data[] = [
                'Name',
                'Total Time Absent',
                'Total Time Absent (Decimal)',
                'Rate',
                'Deduction',
                'Date Scheduled',
                'Time Scheduled',
            ];
        }

        $data[] = [];

        return $data;
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->mergeCells('A1:J1'); // Merge cells from A1 to J1
        $sheet->getStyle('A1:J1')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A1:J1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
        ]);
        $sheet->mergeCells('A2:J2'); // Merge cells from A2 to J2
        $sheet->getStyle('A2:J2')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A2:J2')->applyFromArray([
            'font' => [
                // 'bold' => true,
                'size' => 12,
            ],
        ]);
        $sheet->mergeCells('A4:J4'); // Merge cells from A4 to J4
        $sheet->getStyle('A4:J4')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A4:J4')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
        ]);
        $sheet->mergeCells('A5:J5'); // Merge cells from A5 to J5
        $sheet->getStyle('A5:J5')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A5:J5')->applyFromArray([
            'font' => [
                // 'bold' => true,
                'size' => 12,
            ],
        ]);
        // $sheet->mergeCells('A7:J7'); // Merge cells from A7 to J7
        $sheet->getStyle('A7:J7')->getAlignment()->setHorizontal('center'); // Center align the merged cells
        $sheet->getStyle('A7:J7')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 12,
            ],
        ]);
    }
}