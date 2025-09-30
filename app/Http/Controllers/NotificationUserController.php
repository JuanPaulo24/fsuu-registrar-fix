<?php

namespace App\Http\Controllers;

use App\Models\NotificationUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationUserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $system_id = "SELECT system_id FROM notifications WHERE notifications.id = notification_users.notification_id";

        $data = NotificationUser::where("user_id", $request->user_id)
            ->where(DB::raw("($system_id)"), $request->system_id)
            ->with([
                "notification",
            ])
            ->orderBy("id", "desc")
            ->get();

        return response()->json([
            "success" => true,
            "data" => $data,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function update_notification(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Notification not found",
        ];

        $find = NotificationUser::find($request->id);

        if ($find) {
            $find->update([
                "read" => 1,
            ]);

            $ret = [
                "success" => true,
                "message" => "Notification updated",
            ];
        }

        return response()->json($ret, 200);
    }
}
