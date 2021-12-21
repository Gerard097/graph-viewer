
export const getContent = (group, label) => {
  for (const content of group) {
    if (content.label === label) {
      return content;
    }
  }

  return null;
}

export const getGroupLabel = (group) => {
  const content = getContent(group, 'content_group_label');
  if (content) {
    return content.value[1];
  }

  return null;
}


export const getGroup = (document, groupLabel) => {
  for (const group of document.content_groups) {
    if (getGroupLabel(group) === groupLabel) {
      return group;
    }
  }

  return null;
}


//Use the label from Content item to rename the JSON
//parent item
export const nameItems = (group) => {
  const newGroup = {};
  let repeatedIdx = {};
  for (const content of group) {
    if (content.label !== 'content_group_label') {
      if (newGroup.hasOwnProperty(content.label)) {

        if (repeatedIdx.hasOwnProperty(content.label)) {
          ++repeatedIdx[content.label];
        }
        else {
          repeatedIdx[content.label] = 1;
        }

        newGroup[`${content.label}_${repeatedIdx[content.label]}`] = content.value[1];
      }
      else {
        newGroup[content.label] = content.value[1];
      }
    }
  }

  return newGroup;
}


//Check if we have countent_group_label and use it as the group 
//parent item in JSON or use a default group_N name
export const nameGroups = (node) => {
  
  let newNode = { native_id: node.id, creator: node.creator, date: node.created_date, hash: node.hash, content_groups: {} };
  //Iterate groups
  for (let i = 0; i < node.content_groups.length; ++i) {
    const groupLabel = getGroupLabel(node.content_groups[i]);
    
    if (groupLabel) {
      newNode.content_groups[groupLabel] = nameItems(node.content_groups[i]);
    }
    else {
      newNode.content_groups[`group_${i}`] = nameItems(node.content_groups[i]);
    }
  }
  
  return newNode;
}