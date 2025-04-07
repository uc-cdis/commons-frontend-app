## Explorer Table Cell Renderers

### Links

#### LinkWithIcon

Example:
```json
        "license": {
          "title": "License",
          "type": "link",
          "cellRenderFunction": "LinkWithIcon",
          "sortable": false,
          "params" : {
            "color" : "accent.5",
            "size" : "md",
            "variant" : "filled"
          }
```

Parameters (i.e ```params``):

* color: color as defined in the theme https://bihstaging.data-commons.org/Colors Note that the color "shade" uses colorname.N where N is form 0 to 9. 0 is the lightest 9 is the darkest
* size: size of the icon button, one of: "xs" | "sm" | "md" | "lg" | "xl"
* variant: icons button's appearance as described in https://mantine.dev/core/action-icon
