import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../components/ui/dialog';
import { Settings } from 'lucide-react';

export default function LogoSettings() {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  
  // Load current logo URL on component mount
  useEffect(() => {
    const savedLogoUrl = localStorage.getItem('customLogoUrl');
    if (savedLogoUrl) {
      setCurrentLogo(savedLogoUrl);
    }
  }, []);
  
  // Handle saving the logo URL
  const handleSaveLogo = () => {
    if (logoUrl) {
      localStorage.setItem('customLogoUrl', logoUrl);
      setCurrentLogo(logoUrl);
      
      // Prompt user to refresh for changes to take effect
      window.alert('Logo updated successfully! Refresh the page to see the changes.');
    }
  };
  
  // Handle removing the custom logo
  const handleRemoveLogo = () => {
    localStorage.removeItem('customLogoUrl');
    setCurrentLogo(null);
    setLogoUrl('');
    
    // Prompt user to refresh for changes to take effect
    window.alert('Custom logo removed! Refresh the page to see the changes.');
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Logo Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Logo Settings</DialogTitle>
          <DialogDescription>
            Customize your platform logo. Provide a URL to your logo image.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              placeholder="https://example.com/your-logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter a URL to your logo image. For best results, use a PNG or SVG with transparent background.
            </p>
          </div>
          
          {currentLogo && (
            <div className="mt-4">
              <Label>Current Logo</Label>
              <div className="mt-2 p-4 border rounded-md flex items-center justify-center">
                <img 
                  src={currentLogo} 
                  alt="Current Logo" 
                  className="max-h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjJDMTcuNTIyOCAyMiAyMiAxNy41MjI4IDIyIDEyQzIyIDYuNDc3MTUgMTcuNTIyOCAyIDEyIDJDNi40NzcxNSAyIDIgNi40NzcxNSAyIDEyQzIgMTcuNTIyOCA2LjQ3NzE1IDIyIDEyIDIyWiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTIgMTJIMjIiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMiAyQzE0Ljg5OTUgNC4wNzQzNCAxNi43MzYzIDcuODY4OSAxNyAxMkMxNi43MzYzIDE2LjEzMTEgMTQuODk5NSAxOS45MjU3IDEyIDIyQzkuMTAwNDggMTkuOTI1NyA3LjI2MzcyIDE2LjEzMTEgNyAxMkM3LjI2MzcyIDcuODY4OTEgOS4xMDA0OCA0LjA3NDM0IDEyIDJWMloiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==';
                  }}
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          {currentLogo && (
            <Button 
              variant="outline" 
              onClick={handleRemoveLogo}
              className="mr-auto"
            >
              Remove Logo
            </Button>
          )}
          <Button type="submit" onClick={handleSaveLogo}>
            Save Logo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}