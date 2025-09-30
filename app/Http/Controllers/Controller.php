<?php

namespace App\Http\Controllers;

use App\Events\NotificationPusherEvent;
use App\Models\EmailTemplate;
use App\Models\Notification;
use App\Models\NotificationUser;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

abstract class Controller
{
    public $fullname = "TRIM(CONCAT_WS(' ', IF(lastname IS NOT NULL AND lastname != '', CONCAT(lastname, ','), ''), firstname, IF(middlename='', NULL, middlename), IF(name_ext='', NULL, name_ext)))";

    public function addLeadingZero($number, $length)
    {
        return str_pad($number, $length, '0', STR_PAD_LEFT);
    }

    public function formatSizeUnits($bytes)
    {
        if ($bytes >= 1073741824) {
            $bytes = number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            $bytes = number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            $bytes = number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            $bytes = $bytes . ' bytes';
        } elseif ($bytes == 1) {
            $bytes = $bytes . ' byte';
        } else {
            $bytes = '0 bytes';
        }

        return $bytes;
    }

    public function create_attachment($model, $file, $option)
    {
        if (!empty($option['folder_name'])) {
            $folder_name = !empty($option['folder_name']) ? $option['folder_name'] : null;
            $file_description = !empty($option['file_description']) ? $option['file_description'] : null;

            $fileName = !empty($option['file_name']) ? $option['file_name'] : $file->getClientOriginalName();
            
            // Use custom filename for storage if provided, otherwise use random name
            if (!empty($option['file_name'])) {
                $storageFileName = $option['file_name'];
            } else {
                $storageFileName = Str::random(10) . '.' . $file->getClientOriginalExtension();
            }
            
            $filePath = $file->storeAs($folder_name, $storageFileName, 'public');
            $fileSize = $this->formatSizeUnits($file->getSize());
            $fileExtension = $file->getClientOriginalExtension();

            $file_type = "other";
            $images = ['jpg', 'png', 'gif', 'bmp', 'svg'];
            $documents = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'];
            $videos = ['mp4', 'flv', 'avi', 'mov', 'wmv'];
            $audios = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];

            if (in_array($fileExtension, $images)) {
                $file_type = "image";
            } elseif (in_array($fileExtension, $documents)) {
                $file_type = "document";
            } elseif (in_array($fileExtension, $videos)) {
                $file_type = "video";
            } elseif (in_array($fileExtension, $audios)) {
                $file_type = "audio";
            }

            $attachmentData = [
                'file_name' => $fileName,
                'file_description' => $file_description,
                'file_path' => "storage/" . $filePath,
                'file_size' => $fileSize,
                'file_ext' => $fileExtension,
                'file_type' => $file_type,
                "file_type_origin"  => $file->getClientMimeType(),
            ];

            // Add image dimensions if provided
            if (!empty($option['image_dimensions'])) {
                $attachmentData['image_dimensions'] = $option['image_dimensions'];
            }

            $createAttach = $model->attachments()->create($attachmentData);

            return $createAttach;
        } else {
            return false;
        }
    }

    // $this->pusher_notification([
    // "type" => "Notification",
    // "link_origin" => "http://localhost:4001",
    // "user_id" => 1,
    // ]);

    public function pusher_notification($message)
    {
        event(new NotificationPusherEvent($message));
    }

    // $this->send_notification([
    // "title" => "New Notification",
    // "description" => "New Notification",
    // "user_role_id" => 1,
    // "link" => "http://localhost:4001",
    // "link_id" => 1, // example: user_id
    // "system_id" => 1,
    // ]);

    public function send_notification($options)
    {
        $title = array_key_exists("title", $options) ? $options["title"] : "";

        if (array_key_exists("title", $options) && array_key_exists("system_id", $options)) {
            $title = $options["title"];
            $description = array_key_exists("description", $options) ? $options["description"] : "";
            $user_role_id = array_key_exists("user_role_id", $options) ? $options["user_role_id"] : "";
            $link = array_key_exists("link", $options) ? $options["link"] : "";
            $link_origin = array_key_exists("link_origin", $options) ? $options["link_origin"] : "";
            $link_id = array_key_exists("link_id", $options) ? $options["link_id"] : "";
            $system_id = array_key_exists("system_id", $options) ? $options["system_id"] : "";
            $userIds = array_key_exists("userIds", $options) ? $options["userIds"] : [];

            $dataNotifications = [
                "title" => $title,
                "description" => $description,
                "user_role_id" => $user_role_id,
                "link" => $link,
                "link_id" => $link_id,
                "system_id" => $system_id,
                "created_by" => auth()->user()->id,
            ];

            $queryNotification = Notification::create($dataNotifications);

            if ($queryNotification) {
                foreach ($userIds as $key => $value) {
                    NotificationUser::create([
                        "notification_id" => $queryNotification->id,
                        "user_id" => $value,
                    ]);

                    $this->pusher_notification([
                        "type" => "notification",
                        "link_origin" => $link_origin,
                        "user_id" => $value,
                    ]);
                }

                return [
                    "success" => true,
                    "message" => "Notification sent successfully."
                ];
            }
        } else {
            return [
                "success" => false,
                "message" => "title and system_id are required."
            ];
        }
    }

    public function send_email($options)
    {
        // local testing
        // php artisan queue:work

        $title = array_key_exists("title", $options) ? $options["title"] : "";
        $system_id = array_key_exists("system_id", $options) ? $options["system_id"] : "";

        $to_name = array_key_exists("to_name", $options) ? $options["to_name"] : "";
        $to_email = array_key_exists("to_email", $options) ? $options["to_email"] : "";


        $from_name = array_key_exists("from_name", $options) ? $options["from_name"] : "Father Saturnino Urios University";
        $sender_name = array_key_exists("sender_name", $options) ? $options["sender_name"] : "";
        $from_email = array_key_exists("from_email", $options) ? $options["from_email"] : "dsac@urios.edu.ph";
        $link = array_key_exists("link", $options) ? $options["link"] : "";
        $link_name = array_key_exists("link_name", $options) ? $options["link_name"] : "";
        $code = array_key_exists("code", $options) ? $options["code"] : "";

        $exam_schedule = array_key_exists("exam_schedule", $options) ? $options["exam_schedule"] : "";

        $fullname = array_key_exists("fullname", $options) ? $options["fullname"] : "";
        $account = array_key_exists("account", $options) ? $options["account"] : "";
        $password = array_key_exists("password", $options) ? $options["password"] : "";
        $monitored_by = array_key_exists("monitored_by", $options) ? $options["monitored_by"] : "";
        $date_monitored = array_key_exists("date_monitored", $options) ? $options["monitored_by"] : "";
        $time_monitored = array_key_exists("time_monitored", $options) ? $options["monitored_by"] : "";

        $template = array_key_exists("template", $options) ? $options["template"] : "emails.email-template";
        $position = array_key_exists("position", $options) ? $options["position"] : "position";

        $attachment = array_key_exists("attachment", $options) ? $options["attachment"] : [];

        $new_link = '<a href="' . $link . '" target="_blank"
        style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:roboto, "helvetica neue", helvetica, arial, sans-serif;font-size:18px;color:#333333;border-style:solid;border-color:#FEC300;border-width:10px 20px;display:inline-block;background:#FEC300;border-radius:4px;font-weight:bold;font-style:normal;line-height:22px;width:auto;text-align:center;">' . $link_name . '</a>';

        if ($title && $system_id) {
            $email_template = EmailTemplate::where("title", $title)->where("system_id", $system_id)->first();
            if ($email_template) {
                $subject = $email_template->subject;
                $body = $email_template->body;

                if ($subject) {
                    $subject = str_replace('[user:fullname]', $fullname, $subject); //sample
                }

                if ($body) {

                    if ($to_name) {
                        $body = str_replace('[user:to_name]', $to_name, $body);
                        $body = str_replace('[user:applicant_name]', $to_name, $body);
                    }



                    if ($new_link) {
                        $body = str_replace('[site:set-password-url]', $new_link, $body);
                    }

                    if ($sender_name) {
                        $body = str_replace('[user:sender_name]', $sender_name, $body);
                        $body = str_replace('[user:from_name]', $from_name, $body);
                    }

                    if ($position) {
                        $body = str_replace('[user:position]', $position, $body);
                    }

                    if ($exam_schedule) {
                        $body = str_replace('[user:exam_schedule]', $exam_schedule, $body);
                    }

                    if ($account) {
                        $body = str_replace('[user:account]', $account, $body);
                    }

                    if ($password) {
                        $body = str_replace('[user:password]', $password, $body);
                    }

                    if ($monitored_by) {
                        $body = str_replace('[user:monitored_by]', $monitored_by, $body);
                    }

                    if ($date_monitored) {
                        $body = str_replace('[user:date_monitored]', $date_monitored, $body);
                    }

                    if ($time_monitored) {
                        $body = str_replace('[user:time_monitored]', $time_monitored, $body);
                    }
                }

                // footer signature
                $data_email = [
                    'to_name'       => $to_name,
                    'to_email'      => $to_email,
                    'subject'       => $subject,
                    'from_name'     => $from_name,
                    'from_email'    => $from_email,
                    'template'      => $template,
                    'body_data'     => [
                        "content" => $body,
                    ]
                ];

                if (count($attachment) > 0) {
                    $data_email["attachment"] = $attachment;
                }

                return event(new \App\Events\SendEmailEvent($data_email));
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    public function custom_send_email($options)
    {
        $to_name = array_key_exists("to_name", $options) ? $options["to_name"] : "";
        $to_email = array_key_exists("to_email", $options) ? $options["to_email"] : "";
        $subject = array_key_exists("subject", $options) ? $options["subject"] : "";
        $from_name = array_key_exists("from_name", $options) ? $options["from_name"] : "Father Saturnino Urios University";
        $from_email = array_key_exists("from_email", $options) ? $options["from_email"] : "support@fsuudsac.com";
        $email_body = array_key_exists("email_body", $options) ? $options["email_body"] : "";
        $template = array_key_exists("template", $options) ? $options["template"] : "emails.email-template";
        $attachment = array_key_exists("attachment", $options) ? $options["attachment"] : [];

        $error = false;

        if (!$to_name) {
            $error = true;
        }

        if (!$to_email) {
            $error = true;
        }

        if (!$subject) {
            $error = true;
        }

        if (!$from_name) {
            $error = true;
        }

        if (!$error) {

            // footer signature
            $data_email = [
                'to_name'       => $to_name,
                'to_email'      => $to_email,
                'subject'       => $subject,
                'from_name'     => $from_name,
                'from_email'    => $from_email,
                'template'      => $template,
                'body_data'     => [
                    "content" => $email_body,
                ]
            ];

            if (count($attachment) > 0) {
                $data_email["attachment"] = $attachment;
            }

            return event(new \App\Events\SendEmailEvent($data_email));
        }
    }

    public function generate_school_id($type, $employment_type = null)
    {
        $school_id = "";
        $lastProfile = \App\Models\Profile::whereYear("created_at", date("Y"))->where("school_id", "LIKE", "%-%")->orderBy('id', 'desc')->first();

        if ($lastProfile) {
            $lastSchoolId = $lastProfile->school_id ? $lastProfile->school_id : "";
            $lastSchoolId = $lastSchoolId ? explode("-", $lastSchoolId) : [];
            $lastSchoolId = count($lastSchoolId) > 0 ? ($lastSchoolId[2] ? (int) $lastSchoolId[2] : 0) : 0;
            $lastSchoolId = $lastSchoolId + 1;

            if ($type == "employee") {
                $lastSchoolId = str_pad($lastSchoolId, 3, '0', STR_PAD_LEFT);
                $school_id = $employment_type[0] . "-" . date("y") . "-" . $lastSchoolId;
            } else {
                $lastSchoolId = $lastSchoolId + 1;
                $lastSchoolId = str_pad($lastSchoolId, 6, '0', STR_PAD_LEFT);
                $school_id = date("ym") . "-1-" . $lastSchoolId;
            }
        } else {
            if ($type == "employee") {
                $school_id = $employment_type[0] . "-" . date("y") . "-001";
            } else {
                $school_id = date("ym") . "-1-000001";
            }
        }

        return $school_id;
    }

    public function user_persmissions($user_id, $user_role_id)
    {
        if ($user_id != "" && $user_role_id != "") {
            $dataUserRolePermission = \App\Models\UserRolePermission::where('user_role_id', $user_role_id)
                ->get();

            foreach ($dataUserRolePermission as $key => $value) {
                $dataUserPermission = \App\Models\UserPermission::where('user_id', $user_id)
                    ->where('mod_button_id', $value->mod_button_id)
                    ->first();

                if ($dataUserPermission) {
                    $dataUserPermission->fill([
                        'status' => $value->status,
                        'updated_by' => auth()->user()->id
                    ])->save();
                } else {
                    \App\Models\UserPermission::create([
                        "user_id" => $user_id,
                        "mod_button_id" => $value->mod_button_id,
                        'status' => $value->status,
                        'created_by' => auth()->user()->id
                    ]);
                }
            }
        }
    }

    public function find_profile_by_user_id($user_id)
    {
        return \App\Models\Profile::where('user_id', $user_id)->first();
    }

    // ussage
    // if ($this->check_password($request->password)) {

    // } else {
    //     $ret = [
    //         "success" => false,
    //         "message" => "Password is in correct",
    //     ];
    // }
    public function check_password($password)
    {
        $checkPassword = Hash::check($password, auth()->user()->password);

        return $checkPassword;
    }

    public function schoolYearActive()
    {
        $schoolYearActive = \App\Models\RefSchoolYear::where('status', 1)->first();

        return $schoolYearActive;
    }

    public function monthsInQuarter($quarter)
    {
        $months = [];

        switch ($quarter) {
            case 1:
                $months = ["January", "February", "March"];
                break;
            case 2:
                $months = ["April", "May", "June"];
                break;
            case 3:
                $months = ["July", "August", "September"];
                break;
            case 4:
                $months = ["October", "November", "December"];
                break;
            default:
                $months = [];
                break;
        }

        return $months;
    }

    public function createHistoryData($model, $data)
    {
        $module_name = $data['module_name'];
        $field_name = $data['field_name'];
        $from_value = $data['from_value'];
        $to_value = $data['to_value'];
        $action = $data['action'];
        $ip_address = $data['ip_address'];

        $createHistoryData = $model->historyData()->create([
            'module_name' => $module_name,
            'field_name' => $field_name,
            'from_value' => $from_value,
            'to_value' => $to_value,
            'action' => $action,
            'ip_address' => $ip_address,
            'created_by' => auth()->user()->id,
        ]);

        return $createHistoryData;
    }
}
