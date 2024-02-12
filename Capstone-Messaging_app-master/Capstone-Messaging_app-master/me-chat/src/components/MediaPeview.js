import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

function MediaPreview({ src, closePreview }) {
     // If src is not provided, return null to render nothing
     if (!src) return null;

     return (
          <div className="mediaPreview">
               {/* Close icon for closing the preview */}
               <CloseIcon onClick={closePreview} />

               {/* Image to display the media preview */}
               <img src={src} alt='Preview' />
          </div>
     );
}

export default MediaPreview;
