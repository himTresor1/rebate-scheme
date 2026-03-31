import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Download,
  Upload,
  FileText,
  Eye,
  Trash2,
  ImageIcon,
  Plus
} from 'lucide-react';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

export function DemoInputStates() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="mb-2">Input Field States (All Variants)</h2>
        <p className="text-muted-foreground">
          Complete set of input states for easy Figma export
        </p>
      </div>

      <Card className="p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Default/Empty State */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Default / Empty</Label>
            <Input placeholder="Enter text" />
          </div>

          {/* With Value */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">With Value</Label>
            <Input value="Sample text content" readOnly />
          </div>

          {/* Placeholder */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">With Placeholder</Label>
            <Input placeholder="your.email@example.com" />
          </div>

          {/* Disabled */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Disabled</Label>
            <Input placeholder="Disabled input" disabled />
          </div>

          {/* Disabled with Value */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Disabled with Value</Label>
            <Input value="Disabled content" disabled />
          </div>

          {/* With Label */}
          <div className="space-y-2">
            <Label htmlFor="input-labeled">Email Address</Label>
            <Input id="input-labeled" placeholder="your.email@example.com" />
          </div>

          {/* Password Type */}
          <div className="space-y-2">
            <Label htmlFor="input-password">Password</Label>
            <Input id="input-password" type="password" placeholder="Enter password" />
          </div>

          {/* Number Type */}
          <div className="space-y-2">
            <Label htmlFor="input-number">Amount</Label>
            <Input id="input-number" type="number" placeholder="0.00" />
          </div>

          {/* Date Type */}
          <div className="space-y-2">
            <Label htmlFor="input-date">Date</Label>
            <Input id="input-date" type="date" />
          </div>

        </div>
      </Card>
    </section>
  );
}

export function DemoTextareaStates() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="mb-2">Textarea States (All Variants)</h2>
        <p className="text-muted-foreground">
          Complete set of textarea states for easy Figma export
        </p>
      </div>

      <Card className="p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Default/Empty */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Default / Empty</Label>
            <Textarea placeholder="Enter description" rows={4} />
          </div>

          {/* With Value */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">With Value</Label>
            <Textarea value="This is a sample description text that demonstrates how the textarea looks when filled with content." rows={4} readOnly />
          </div>

          {/* Disabled */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Disabled</Label>
            <Textarea placeholder="Disabled textarea" disabled rows={4} />
          </div>

          {/* With Label */}
          <div className="space-y-2">
            <Label htmlFor="textarea-labeled">Comments</Label>
            <Textarea id="textarea-labeled" placeholder="Enter your comments here" rows={4} />
          </div>

        </div>
      </Card>
    </section>
  );
}

export function DemoFileUploads() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="mb-2">File Upload Components</h2>
        <p className="text-muted-foreground">
          File and image upload interfaces
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Basic File Upload */}
        <Card className="p-6 bg-white">
          <h3 className="mb-4">Basic File Upload</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#023F40] transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, or DOCX (max. 10MB)
              </p>
            </div>
          </div>
        </Card>

        {/* Image Upload */}
        <Card className="p-6 bg-white">
          <h3 className="mb-4">Image Upload</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#023F40] transition-colors cursor-pointer">
              <ImageIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                Upload an image
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or JPEG (max. 5MB)
              </p>
            </div>
          </div>
        </Card>

        {/* File Upload with Button */}
        <Card className="p-6 bg-white">
          <h3 className="mb-4">File Upload with Button</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-input">Upload Document</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button variant="outline">
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
                <span className="text-sm text-muted-foreground">No file chosen</span>
              </div>
            </div>
          </div>
        </Card>

        {/* File Upload with Preview */}
        <Card className="p-6 bg-white">
          <h3 className="mb-4">Uploaded File Preview</h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#023F40]/10 rounded flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#023F40]" />
                </div>
                <div>
                  <p className="text-sm">application_form.pdf</p>
                  <p className="text-xs text-muted-foreground">2.4 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </section>
  );
}

export function DemoDownloadButtons() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="mb-2">Download / Export Buttons</h2>
        <p className="text-muted-foreground">
          Button variants for download and export actions
        </p>
      </div>

      <Card className="p-6 bg-white">
        <div className="space-y-8">
          
          {/* Primary Download Buttons */}
          <div>
            <h4 className="mb-4">Primary Download Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button>
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Button>
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button>
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </div>
          </div>

          <Separator />

          {/* Secondary Export Buttons */}
          <div>
            <h4 className="mb-4">Secondary Export Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary">
                <Download className="w-4 h-4" />
                Download CSV
              </Button>
              <Button variant="secondary">
                <Download className="w-4 h-4" />
                Download Excel
              </Button>
              <Button variant="secondary">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>

          <Separator />

          {/* Outline Export Buttons */}
          <div>
            <h4 className="mb-4">Outline Export Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4" />
                Export as PDF
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4" />
                Export as CSV
              </Button>
            </div>
          </div>

          <Separator />

          {/* Icon-Only Download Buttons */}
          <div>
            <h4 className="mb-4">Icon-Only Download Buttons</h4>
            <div className="flex flex-wrap gap-3">
              <Button size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="secondary">
                <Download className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Different Sizes */}
          <div>
            <h4 className="mb-4">Different Sizes</h4>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-muted-foreground w-20">Small:</span>
                <Button size="sm">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-muted-foreground w-20">Default:</span>
                <Button>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-sm text-muted-foreground w-20">Large:</span>
                <Button size="lg">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>

        </div>
      </Card>
    </section>
  );
}

export function DemoModals() {
  return (
    <section>
      <div className="mb-6">
        <h2 className="mb-2">Modal / Dialog Components</h2>
        <p className="text-muted-foreground">
          Dialog and modal patterns used throughout the system - shown at exact sizes
        </p>
      </div>

      <div className="space-y-8">
        
        {/* Basic Modal - Static Display */}
        <Card className="p-6 bg-white">
          <h3 className="mb-4">Basic Modal</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Standard modal for general purpose dialogs (max-width: 512px)
          </p>
          
          <div className="flex justify-center">
            <div className="w-full max-w-lg border border-gray-200 rounded-lg p-6 bg-white shadow-lg">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg leading-none">Modal Title</h3>
                  <p className="text-sm text-muted-foreground">
                    This is a description that provides context about the modal's purpose.
                  </p>
                </div>
                
                {/* Content */}
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Modal content goes here. This can include forms, information, or any other content.
                  </p>
                </div>
                
                {/* Footer */}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Confirmation Modal - Static Display */}
        <Card className="p-6 bg-white">
          <h3 className="mb-4">Confirmation Modal</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Modal for confirming important actions (max-width: 512px)
          </p>
          
          <div className="flex justify-center">
            <div className="w-full max-w-lg border border-gray-200 rounded-lg p-6 bg-white shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg leading-none">Are you sure?</h3>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. This will permanently delete the item.
                  </p>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Destructive Modal - Static Display */}
        <Card className="p-6 bg-white">
          <h3 className="mb-4">Destructive Action Modal</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Modal with alert styling for destructive actions (max-width: 512px)
          </p>
          
          <div className="flex justify-center">
            <div className="w-full max-w-lg border-2 border-destructive/20 rounded-lg p-6 bg-white shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="flex items-center gap-2 text-lg leading-none">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    Delete Confirmation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone. Are you sure you want to proceed?
                  </p>
                </div>
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Modal - Static Display */}
        <Card className="p-6 bg-white">
          <h3 className="mb-4">Form Modal</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Modal containing a form for data entry (max-width: 512px)
          </p>
          
          <div className="flex justify-center">
            <div className="w-full max-w-lg border border-gray-200 rounded-lg p-6 bg-white shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg leading-none">Add New Item</h3>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form below to add a new item.
                  </p>
                </div>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-name-static">Name</Label>
                    <Input id="modal-name-static" placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-description-static">Description</Label>
                    <Textarea id="modal-description-static" placeholder="Enter description" rows={3} />
                  </div>
                </div>
                
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </section>
  );
}