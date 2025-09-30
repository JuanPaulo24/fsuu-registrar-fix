<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attachment;

class DefaultBannerController extends Controller
{
    /**
     * Get default banners
     */
    public function index()
    {
        // Get default header and footer banners
        $headerImages = Attachment::where('attachmentable_type', 'App\Models\DefaultBanner')
            ->where('attachmentable_id', 1) // Use ID 1 for default banners
            ->where('file_description', 'Default Header Image')
            ->orderBy('created_at', 'desc')
            ->get();

        $footerImages = Attachment::where('attachmentable_type', 'App\Models\DefaultBanner')
            ->where('attachmentable_id', 1) // Use ID 1 for default banners
            ->where('file_description', 'Default Footer Image')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'header_images' => $headerImages,
                'footer_images' => $footerImages
            ]
        ], 200);
    }

    /**
     * Store/update default banners
     */
    public function store(Request $request)
    {
        $ret = [
            "success" => false,
            "message" => "Default banners not updated."
        ];

        $data = $request->validate([
            "header_images" => "nullable|array",
            "header_images.*" => "image|mimes:jpeg,png,jpg,gif,svg|max:2048",
            "footer_images" => "nullable|array", 
            "footer_images.*" => "image|mimes:jpeg,png,jpg,gif,svg|max:2048",
            "header_image_dimensions" => "nullable|array",
            "footer_image_dimensions" => "nullable|array",
            "existing_header_images" => "nullable|array",
            "existing_footer_images" => "nullable|array"
        ]);

        // Remove image data from main data array
        $imageData = [
            'header_images' => $request->file('header_images') ?? [],
            'footer_images' => $request->file('footer_images') ?? [],
            'header_image_dimensions' => $request->input('header_image_dimensions', []),
            'footer_image_dimensions' => $request->input('footer_image_dimensions', []),
            'existing_header_images' => $request->input('existing_header_images', []),
            'existing_footer_images' => $request->input('existing_footer_images', [])
        ];

        try {
            // Handle header images (only allow 1)
            if (!empty($imageData['header_images'])) {
                // Remove existing header images
                $existingHeaderImages = Attachment::where('attachmentable_type', 'App\Models\DefaultBanner')
                    ->where('attachmentable_id', 1)
                    ->where('file_description', 'Default Header Image')
                    ->get();
                
                foreach ($existingHeaderImages as $headerImage) {
                    // Delete the file
                    $filePath = str_replace('storage/', '', $headerImage->file_path);
                    $fullPath = storage_path('app/public/' . $filePath);
                    if (file_exists($fullPath)) {
                        unlink($fullPath);
                    }
                    // Delete the attachment record
                    $headerImage->delete();
                }
                
                // Take only the first image
                $image = $imageData['header_images'][0];
                $dimensions = $imageData['header_image_dimensions'][0] ?? null;
                $this->create_default_attachment($image, [
                    "folder_name" => "default_banners/header_images",
                    "file_description" => "Default Header Image",
                    "image_dimensions" => $dimensions
                ]);
            }

            // Handle footer images (only allow 1)
            if (!empty($imageData['footer_images'])) {
                // Remove existing footer images
                $existingFooterImages = Attachment::where('attachmentable_type', 'App\Models\DefaultBanner')
                    ->where('attachmentable_id', 1)
                    ->where('file_description', 'Default Footer Image')
                    ->get();
                
                foreach ($existingFooterImages as $footerImage) {
                    // Delete the file
                    $filePath = str_replace('storage/', '', $footerImage->file_path);
                    $fullPath = storage_path('app/public/' . $filePath);
                    if (file_exists($fullPath)) {
                        unlink($fullPath);
                    }
                    // Delete the attachment record
                    $footerImage->delete();
                }
                
                // Take only the first image
                $image = $imageData['footer_images'][0];
                $dimensions = $imageData['footer_image_dimensions'][0] ?? null;
                $this->create_default_attachment($image, [
                    "folder_name" => "default_banners/footer_images",
                    "file_description" => "Default Footer Image",
                    "image_dimensions" => $dimensions
                ]);
            }

            // Update dimensions for existing header images
            if (!empty($imageData['existing_header_images'])) {
                foreach ($imageData['existing_header_images'] as $imageId => $dimensions) {
                    $attachment = Attachment::find($imageId);
                    if ($attachment && $attachment->attachmentable_type === 'App\Models\DefaultBanner') {
                        $attachment->update([
                            'image_dimensions' => [
                                'width' => $dimensions['width'],
                                'height' => $dimensions['height']
                            ]
                        ]);
                    }
                }
            }

            // Update dimensions for existing footer images
            if (!empty($imageData['existing_footer_images'])) {
                foreach ($imageData['existing_footer_images'] as $imageId => $dimensions) {
                    $attachment = Attachment::find($imageId);
                    if ($attachment && $attachment->attachmentable_type === 'App\Models\DefaultBanner') {
                        $attachment->update([
                            'image_dimensions' => [
                                'width' => $dimensions['width'],
                                'height' => $dimensions['height']
                            ]
                        ]);
                    }
                }
            }

            $ret = [
                "success" => true,
                "message" => "Default banners updated successfully."
            ];

        } catch (\Exception $e) {
            \Log::error('Error updating default banners: ' . $e->getMessage());
            $ret = [
                "success" => false,
                "message" => "Failed to update default banners: " . $e->getMessage()
            ];
        }

        return response()->json($ret, 200);
    }

    /**
     * Create attachment for default banners
     */
    private function create_default_attachment($file, $options = [])
    {
        $attachment = new Attachment();
        $attachment->attachmentable_type = 'App\Models\DefaultBanner';
        $attachment->attachmentable_id = 1; // Use ID 1 for default banners
        $attachment->file_type = 'image';
        $attachment->file_description = $options['file_description'] ?? 'Default Banner';
        $attachment->file_name = $file->getClientOriginalName();
        $attachment->file_size = $file->getSize();
        $attachment->created_by = auth()->user()->id ?? 1;
        
        // Handle image dimensions if provided
        if (isset($options['image_dimensions']) && $options['image_dimensions']) {
            $attachment->image_dimensions = $options['image_dimensions'];
        }

        // Store the file
        $folderName = $options['folder_name'] ?? 'default_banners';
        $fileName = time() . '_' . $file->getClientOriginalName();
        $filePath = $file->storeAs($folderName, $fileName, 'public');
        
        $attachment->file_path = 'storage/' . $filePath;
        $attachment->save();

        return $attachment;
    }
}