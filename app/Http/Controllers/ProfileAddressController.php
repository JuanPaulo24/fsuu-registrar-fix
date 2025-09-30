<?php

namespace App\Http\Controllers;

use App\Models\ProfileAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileAddressController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {

        $barangay_name = "SELECT barangay FROM ref_barangays WHERE ref_barangays.id=profile_addresses.barangay_id AND category='FAMILY ADDRESS'";

        $data = ProfileAddress::select([
            '*',
            DB::raw("($barangay_name) as barangay_name")
        ]);

        $dataQuery = ProfileAddress::query();

        if (isset($request->profile_id)) {
            $dataQuery->where("profile_id", $request->profile_id);
        }

        $data = $dataQuery->get();

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
        $ret = [
            "success" => false,
            "message" => "Data not updated",
            "request" => $request->all()
        ];

        return response()->json($ret, 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ProfileAddress  $profileAddress
     * @return \Illuminate\Http\Response
     */
    public function show(ProfileAddress $profileAddress)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ProfileAddress  $profileAddress
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, ProfileAddress $profileAddress)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ProfileAddress  $profileAddress
     * @return \Illuminate\Http\Response
     */
    public function destroy(ProfileAddress $profileAddress)
    {
        //
    }
}
