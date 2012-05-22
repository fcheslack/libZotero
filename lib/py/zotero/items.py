import logging
from item import *


class Items(object):
    def __init__(self):
        self.itemObjects = {}

    def __len__(self):
        return len(self.itemObjects)

    def __getitem__(self, itemKey):
        if itemKey in self.itemObjects:
            return self.itemObjects[itemKey]
        else:
            raise KeyError

    def __setitem__(self, itemKey, item):
        self.itemObjects[itemKey] = item

    def __delitem__(self, itemKey):
        del self.itemObjects[itemKey]

    def __iter__(self):
        return self.itemObjects.__iter__()

    def __reversed__(self):
        ritems = Items()
        ritems.itemObjects = self.itemObjects.reversed()
        return ritems

    def __contains__(self, itemKey):
        return itemKey in self.itemObjects

    def getItem(self, itemKey):
        if itemKey in self.itemObjects:
            return self.itemObjects[itemKey]
        else:
            return None

    def addItem(self, item):
        itemKey = item.itemKey
        self.itemObjects[itemKey] = item
        return item

    def addItemsFromFeed(self, feed):
        addedItems = []
        for entry in feed.entries:
            item = Item(entry)
            self.addItem(item)
            addedItems.append(item)
        return addedItems

    def replaceItem(self, item):
        itemKey = item.itemKey
        self.itemObjects[itemKey] = item
